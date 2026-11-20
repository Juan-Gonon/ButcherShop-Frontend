import { useCallback, useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { LuClipboardList } from 'react-icons/lu'
import { ConfirmedOrdersList } from './components/ConfirmedOrdersList'
import { PreparingOrdersList } from './components/PreparingOrdersList'
import type { KdsOrder } from './types/kds'

const POLLING_INTERVAL_MS = 10_000

export const KdsPage = () => {
  const [preparingRefreshKey, setPreparingRefreshKey] = useState(0)
  const [pollingEnabled, setPollingEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [soundInitializing, setSoundInitializing] = useState(false)
  const [soundUnavailable, setSoundUnavailable] = useState(false)
  const confirmedOrdersRefetch = useRef<(() => Promise<void>) | null>(null)
  const confirmedOrdersPoll = useRef<(() => boolean) | null>(null)
  const preparingOrdersPoll = useRef<(() => boolean) | null>(null)
  const observedOrderUuids = useRef(new Set<string>())
  const audioContext = useRef<AudioContext | null>(null)
  const soundEnabledRef = useRef(false)
  const soundInitializationInProgress = useRef(false)
  const notificationQueue = useRef<KdsOrder[]>([])
  const queuedNotificationUuids = useRef(new Set<string>())
  const notificationProcessorRunning = useRef(false)
  const notificationTimer = useRef<number | null>(null)
  const notificationOpen = useRef(false)
  const processNextNotificationRef = useRef<() => void>(() => undefined)
  const registerConfirmedRefetch = useCallback((refetch: (() => Promise<void>) | null) => {
    confirmedOrdersRefetch.current = refetch
  }, [])
  const registerConfirmedPoll = useCallback((poll: (() => boolean) | null) => {
    confirmedOrdersPoll.current = poll
  }, [])
  const registerPreparingPoll = useCallback((poll: (() => boolean) | null) => {
    preparingOrdersPoll.current = poll
  }, [])
  const getObservedOrderUuids = useCallback(() => observedOrderUuids.current, [])
  const markOrdersObserved = useCallback((uuids: string[]) => {
    uuids.forEach((uuid) => observedOrderUuids.current.add(uuid))
  }, [])
  const refreshConfirmedOrders = useCallback(() => {
    const refetch = confirmedOrdersRefetch.current
    if (!refetch) return Promise.reject(new Error('La lista de pedidos confirmados todavía no está disponible.'))
    return refetch()
  }, [])

  const playNewOrderSound = useCallback(() => {
    const context = audioContext.current
    if (!soundEnabledRef.current) return
    if (!context || context.state !== 'running') {
      soundEnabledRef.current = false
      setSoundEnabled(false)
      setSoundUnavailable(true)
      return
    }

    try {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const startAt = context.currentTime
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(740, startAt)
      gain.gain.setValueAtTime(0.045, startAt)
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.16)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(startAt)
      oscillator.stop(startAt + 0.16)
    } catch {
      soundEnabledRef.current = false
      setSoundEnabled(false)
      setSoundUnavailable(true)
    }
  }, [])

  const toggleSound = useCallback(async () => {
    if (soundInitializationInProgress.current) return

    if (soundEnabledRef.current) {
      soundEnabledRef.current = false
      setSoundEnabled(false)
      const context = audioContext.current
      if (context?.state === 'running') {
        void context.suspend().catch(() => setSoundUnavailable(true))
      }
      return
    }

    soundInitializationInProgress.current = true
    setSoundInitializing(true)
    let context = audioContext.current
    let createdContext = false
    try {
      if (!context || context.state === 'closed') {
        context = new AudioContext()
        createdContext = true
      }
      await context.resume()
      if (context.state !== 'running') throw new Error('Audio is unavailable')
      audioContext.current = context
      soundEnabledRef.current = true
      setSoundEnabled(true)
      setSoundUnavailable(false)
    } catch {
      soundEnabledRef.current = false
      if (createdContext && context) void context.close().catch(() => undefined)
      setSoundEnabled(false)
      setSoundUnavailable(true)
    } finally {
      soundInitializationInProgress.current = false
      setSoundInitializing(false)
    }
  }, [])

  const processNextNotification = useCallback(() => {
    if (notificationProcessorRunning.current || notificationQueue.current.length === 0) return

    if (Swal.isVisible()) {
      if (notificationTimer.current === null) {
        notificationTimer.current = window.setTimeout(() => {
          notificationTimer.current = null
          processNextNotificationRef.current()
        }, 400)
      }
      return
    }

    const order = notificationQueue.current.shift()
    if (!order) return

    notificationProcessorRunning.current = true
    notificationOpen.current = true
    playNewOrderSound()
    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Nuevo pedido confirmado',
      text: `Pedido #${order.id_pedido}`,
      showConfirmButton: false,
      showCloseButton: true,
      timer: 5000,
      timerProgressBar: true
    }).catch(() => undefined).finally(() => {
      notificationOpen.current = false
      notificationProcessorRunning.current = false
      if (notificationQueue.current.length > 0 && notificationTimer.current === null) {
        notificationTimer.current = window.setTimeout(() => {
          notificationTimer.current = null
          processNextNotificationRef.current()
        }, 250)
      }
    })
  }, [playNewOrderSound])

  useEffect(() => {
    processNextNotificationRef.current = processNextNotification
  }, [processNextNotification])

  const notifyNewOrders = useCallback((orders: KdsOrder[]) => {
    orders.forEach((order) => {
      if (queuedNotificationUuids.current.has(order.uuid)) return
      queuedNotificationUuids.current.add(order.uuid)
      notificationQueue.current.push(order)
    })
    processNextNotification()
  }, [processNextNotification])

  useEffect(() => {
    let intervalId: number | null = null

    const stopPolling = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId)
        intervalId = null
      }
      setPollingEnabled(false)
    }

    const startPolling = () => {
      if (document.visibilityState === 'hidden') {
        setPollingEnabled(false)
        return
      }
      setPollingEnabled(true)
      if (intervalId !== null) return
      intervalId = window.setInterval(() => {
        confirmedOrdersPoll.current?.()
        preparingOrdersPoll.current?.()
      }, POLLING_INTERVAL_MS)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stopPolling()
      else startPolling()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    handleVisibilityChange()

    return () => {
      if (intervalId !== null) window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => () => {
    if (notificationTimer.current !== null) window.clearTimeout(notificationTimer.current)
    notificationQueue.current = []
    if (notificationOpen.current && Swal.isVisible()) Swal.close()
    if (audioContext.current && audioContext.current.state !== 'closed') {
      void audioContext.current.close().catch(() => undefined)
      audioContext.current = null
    }
  }, [])

  return (
    <div className='min-h-full bg-bg-light/40 p-2.5 sm:p-3.5 lg:p-4'>
      <div className='mx-auto flex w-full max-w-screen-2xl flex-col gap-4'>
        <header className='flex flex-wrap items-center gap-3 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_8px_30px_-10px_rgba(92,77,60,0.12)] backdrop-blur-sm sm:p-5'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white'>
            <LuClipboardList aria-hidden='true' className='h-5 w-5' />
          </div>
          <div className='min-w-0'>
            <p className='font-label text-[11px] font-medium uppercase tracking-[0.12em] text-secondary'>
              KDS · Operación de carnicería
            </p>
            <h1 className='text-xl font-semibold tracking-tight text-neutral sm:text-2xl'>
              Mesa de preparación
            </h1>
            <p className='mt-1 text-sm text-neutral'>Pedidos confirmados y zona de trabajo.</p>
          </div>
          <div className='ml-auto flex flex-col items-end gap-1'>
            <button
              aria-pressed={soundEnabled}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-wait disabled:opacity-70 ${soundEnabled ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-neutral/25 bg-white text-neutral hover:bg-neutral/5'}`}
              disabled={soundInitializing}
              onClick={() => { void toggleSound() }}
              type='button'
            >
              <span aria-hidden='true' className={`relative h-5 w-9 rounded-full transition-colors ${soundEnabled ? 'bg-emerald-600' : 'bg-neutral/35'}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${soundEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </span>
              {soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
            </button>
            {soundInitializing && <span className='text-right text-xs text-neutral/70' role='status'>Activando sonido…</span>}
            {soundUnavailable && (
              <span className='max-w-56 text-right text-xs text-primary' role='status'>No se pudo habilitar o reproducir el sonido. Puedes volver a intentarlo.</span>
            )}
          </div>
        </header>

        <div className='grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-12'>
          <div className='min-w-0 xl:col-span-5'>
            <ConfirmedOrdersList
              onPreparationStarted={() => setPreparingRefreshKey((key) => key + 1)}
              onRefetchReady={registerConfirmedRefetch}
              onPollingReady={registerConfirmedPoll}
              getObservedOrderUuids={getObservedOrderUuids}
              onOrdersObserved={markOrdersObserved}
              onNewOrders={notifyNewOrders}
              pollingEnabled={pollingEnabled}
            />
          </div>
          <div className='min-w-0 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm sm:p-5 xl:col-span-7'>
            <PreparingOrdersList
              refreshConfirmedOrders={refreshConfirmedOrders}
              refreshKey={preparingRefreshKey}
              onPollingReady={registerPreparingPoll}
              onOrdersObserved={markOrdersObserved}
              pollingEnabled={pollingEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
