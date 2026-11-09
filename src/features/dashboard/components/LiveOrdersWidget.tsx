import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiClipboard, FiRefreshCw, FiTruck } from 'react-icons/fi'
import { useRef } from 'react'
import { useLiveOrders } from '../hooks/useLiveOrders'
import { LiveOrderCard } from './LiveOrderCard'

const LoadingCards = () => (
  <div aria-label='Cargando pedidos en curso' aria-live='polite' className='flex gap-3 overflow-hidden py-1 sm:gap-4'>
    {[0, 1, 2].map((item) => (
      <div className='h-72 w-[min(84vw,21rem)] shrink-0 animate-pulse rounded-2xl border border-bg-light/80 bg-white p-4 sm:w-80' key={item}>
        <div className='h-3 w-24 rounded bg-bg-light' />
        <div className='mt-3 h-5 w-40 rounded bg-bg-light/80' />
        <div className='mt-5 h-9 rounded-xl bg-bg-light/60' />
        <div className='mt-5 space-y-3'><div className='h-4 rounded bg-bg-light/70' /><div className='h-4 w-4/5 rounded bg-bg-light/70' /></div>
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
    <section aria-labelledby='live-orders-title' className='mt-4 min-w-0 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_12px_34px_-16px_rgba(92,77,60,0.22)] backdrop-blur-sm sm:p-5'>
      <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-start gap-3'>
          <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-xl text-secondary'>
            <FiTruck aria-hidden='true' />
          </span>
          <div className='min-w-0'>
            <h2 className='font-headline text-lg font-semibold tracking-tight text-neutral sm:text-xl' id='live-orders-title'>Pedidos en curso</h2>
            <p className='mt-1 text-sm text-neutral/85'>Actividad reciente de pedidos.</p>
          </div>
        </div>

        {status === 'success' && data && data.length > 1 && (
          <div className='flex items-center gap-2 self-end sm:self-auto'>
            <button aria-label='Desplazar pedidos a la izquierda' className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bg-light bg-white text-neutral transition hover:bg-bg-light/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary' onClick={() => scrollTrack(-1)} type='button'>
              <FiArrowLeft aria-hidden='true' />
            </button>
            <button aria-label='Desplazar pedidos a la derecha' className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bg-light bg-white text-neutral transition hover:bg-bg-light/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary' onClick={() => scrollTrack(1)} type='button'>
              <FiArrowRight aria-hidden='true' />
            </button>
          </div>
        )}
      </header>

      <div aria-live='polite' className='mt-5 min-w-0'>
        {status === 'loading' && <LoadingCards />}

        {status === 'error' && (
          <div className='rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4'>
            <p className='flex items-start gap-2 text-sm font-medium text-primary'><FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />{error ?? 'No se pudieron cargar los pedidos en curso.'}</p>
            <button className='mt-4 inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:mt-0' onClick={retry} type='button'>
              <FiRefreshCw aria-hidden='true' /> Reintentar
            </button>
          </div>
        )}

        {status === 'empty' && (
          <div className='flex min-h-40 flex-col items-center justify-center rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-6 text-center'>
            <FiClipboard aria-hidden='true' className='text-2xl text-secondary' />
            <p className='mt-3 font-semibold text-neutral'>No hay pedidos en curso</p>
            <p className='mt-1 text-sm text-neutral/85'>Cuando haya actividad, aparecerá aquí.</p>
          </div>
        )}

        {status === 'success' && data && (
          <div ref={trackRef} className='flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:thin] sm:gap-4' role='region' aria-label='Carrusel de pedidos en curso' tabIndex={0}>
            {data.map((order) => <div className='snap-start' key={order.uuid}><LiveOrderCard order={order} /></div>)}
          </div>
        )}
      </div>
    </section>
  )
}
