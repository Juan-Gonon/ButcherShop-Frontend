import { useCallback, useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { LuClipboardList } from 'react-icons/lu'
import { ConfirmedOrdersList } from './components/ConfirmedOrdersList'
import { PreparingOrdersList } from './components/PreparingOrdersList'
import type { KdsOrder } from './types/kds'

const POLLING_INTERVAL_MS = 10_000

export const KdsPage = () => {
  const [preparingRefreshKey, setPreparingRefreshKey] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [soundUnavailable, setSoundUnavailable] = useState(false)
  const confirmedOrdersRefetch = useRef<(() => Promise<void>) | null>(null)
  const confirmedOrdersPoll = useRef<(() => boolean) | null>(null)
  const preparingOrdersPoll = useRef<(() => boolean) | null>(null)
  const observedOrderUuids = useRef(new Set<string>())
  const audioContext = useRef<AudioContext | null>(null)
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
    if (!soundEnabled || !context || context.state !== 'running') return

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
      // Audio is optional; browser restrictions must not interrupt KDS work.
    }
  }, [soundEnabled])

  const enableSound = useCallback(async () => {
    if (audioContext.current?.state === 'running') {
      setSoundEnabled(true)
      return
    }

    let context: AudioContext | null = null
    try {
      context = new AudioContext()
      await context.resume()
      if (context.state !== 'running') throw new Error('Audio is unavailable')
      audioContext.current = context
      setSoundEnabled(true)
      setSoundUnavailable(false)
    } catch {
      if (context) void context.close().catch(() => undefined)
      setSoundEnabled(false)
      setSoundUnavailable(true)
    }
  }, [])

  const notifyNewOrders = useCallback((orders: KdsOrder[]) => {
    playNewOrderSound()
    if (Swal.isVisible()) return

    const orderNumbers = orders.map((order) => `#${order.id_pedido}`).join(', ')
    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: orders.length === 1 ? 'Nuevo pedido confirmado' : 'Nuevos pedidos confirmados',
      text: `Pedido${orders.length === 1 ? '' : 's'} ${orderNumbers}`,
      showConfirmButton: false,
      showCloseButton: true,
      timer: 5000,
      timerProgressBar: true
    })
  }, [playNewOrderSound])

  useEffect(() => {
    let intervalId: number | null = null

    const stopPolling = () => {
      if (intervalId === null) return
      window.clearInterval(intervalId)
      intervalId = null
    }

    const startPolling = () => {
      if (intervalId !== null || document.visibilityState === 'hidden') return
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
    startPolling()

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => () => {
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
              className='inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-secondary/25 bg-white px-3 text-sm font-semibold text-secondary transition hover:bg-secondary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary'
              onClick={() => { void enableSound() }}
              type='button'
            >
              {soundEnabled ? 'Sonido activado' : 'Activar sonido'}
            </button>
            {soundUnavailable && (
              <span className='text-right text-xs text-neutral/70' role='status'>Sonido no disponible en este navegador.</span>
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
            />
          </div>
          <div className='min-w-0 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm sm:p-5 xl:col-span-7'>
            <PreparingOrdersList
              refreshConfirmedOrders={refreshConfirmedOrders}
              refreshKey={preparingRefreshKey}
              onPollingReady={registerPreparingPoll}
              onOrdersObserved={markOrdersObserved}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
