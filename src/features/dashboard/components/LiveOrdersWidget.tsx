import { useRef } from 'react'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiClipboard,
  FiRefreshCw,
  FiTruck
} from 'react-icons/fi'
import { useLiveOrders } from '../hooks/useLiveOrders'
import { LiveOrderCard } from './LiveOrderCard'

const LoadingCards = () => (
  <div aria-label='Cargando pedidos en curso' aria-live='polite' className='flex gap-4 overflow-hidden py-1'>
    {[0, 1, 2].map((item) => (
      <div className='h-72 w-[min(86vw,22rem)] shrink-0 animate-pulse rounded-2xl border border-bg-light/80 bg-white p-4 sm:w-[22rem]' key={item}>
        <div className='flex justify-between gap-4'>
          <div className='space-y-2'><div className='h-3 w-16 rounded bg-bg-light' /><div className='h-5 w-36 rounded bg-bg-light/80' /></div>
          <div className='h-6 w-24 rounded-full bg-bg-light/80' />
        </div>
        <div className='mt-5 h-8 rounded-xl bg-bg-light/60' />
        <div className='mt-5 space-y-3 rounded-xl bg-bg-light/45 p-3'><div className='h-4 rounded bg-bg-light/80' /><div className='h-4 w-4/5 rounded bg-bg-light/80' /></div>
        <div className='mt-8 h-8 rounded bg-bg-light/80' />
      </div>
    ))}
  </div>
)

export const LiveOrdersWidget = () => {
  const { data, status, error, retry } = useLiveOrders()
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollTrack = (direction: -1 | 1) => {
    if (!trackRef.current) return
    trackRef.current.scrollBy({ left: direction * trackRef.current.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section aria-labelledby='live-orders-title' className='mt-4 min-w-0 rounded-3xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur-xl sm:p-5 lg:p-6'>
      <header className='mb-4 flex flex-col gap-3 border-b border-bg-light/80 pb-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-center gap-3'>
          <span className='relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-lg text-secondary'>
            <FiTruck aria-hidden='true' />
            {status === 'success' && <span aria-hidden='true' className='absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-secondary' />}
          </span>
          <div className='min-w-0'>
            <h2 className='font-headline text-lg font-semibold tracking-tight text-neutral sm:text-xl' id='live-orders-title'>Pedidos en curso</h2>
            <p className='mt-0.5 text-sm text-neutral/80'>Actividad reciente de pedidos</p>
          </div>
        </div>

        <div className='flex items-center justify-between gap-3 sm:justify-end'>
          {status === 'success' && data && (
            <span className='rounded-full bg-bg-light/75 px-3 py-1.5 font-label text-[11px] font-medium text-neutral'>
              {data.length} {data.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          )}
          {status === 'success' && data && data.length > 1 && (
            <div className='flex items-center gap-2'>
              <button aria-label='Desplazar pedidos a la izquierda' className='inline-flex h-9 w-9 items-center justify-center rounded-xl border border-bg-light bg-white text-neutral shadow-sm transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95' onClick={() => scrollTrack(-1)} type='button'>
                <FiArrowLeft aria-hidden='true' />
              </button>
              <button aria-label='Desplazar pedidos a la derecha' className='inline-flex h-9 w-9 items-center justify-center rounded-xl border border-bg-light bg-white text-neutral shadow-sm transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95' onClick={() => scrollTrack(1)} type='button'>
                <FiArrowRight aria-hidden='true' />
              </button>
            </div>
          )}
        </div>
      </header>

      <div aria-live='polite' className='min-w-0'>
        {status === 'loading' && <LoadingCards />}

        {status === 'error' && (
          <div className='rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4'>
            <p className='flex items-start gap-2 text-sm font-medium text-primary'><FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />{error ?? 'No se pudieron cargar los pedidos en curso.'}</p>
            <button className='mt-4 inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:mt-0' onClick={retry} type='button'>
              <FiRefreshCw aria-hidden='true' /> Reintentar
            </button>
          </div>
        )}

        {status === 'empty' && (
          <div className='flex min-h-40 flex-col items-center justify-center rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-6 text-center'>
            <FiClipboard aria-hidden='true' className='text-2xl text-secondary' />
            <p className='mt-3 font-semibold text-neutral'>No hay pedidos en curso</p>
            <p className='mt-1 text-sm text-neutral/80'>Cuando haya actividad, aparecerá aquí.</p>
          </div>
        )}

        {status === 'success' && data && (
          <div ref={trackRef} className='flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:thin] sm:gap-5' role='region' aria-label='Carrusel de pedidos en curso' tabIndex={0}>
            {data.map((order) => <div className='snap-start' key={order.uuid}><LiveOrderCard order={order} /></div>)}
          </div>
        )}
      </div>
    </section>
  )
}