import { useState } from 'react'
import { FiAlertCircle, FiClipboard, FiRefreshCw } from 'react-icons/fi'
import { useKdsOrders } from '../hooks/useKdsOrders'
import { PreparingOrderCard } from './PreparingOrderCard'

const PAGE_SIZE = 20

interface PreparingOrdersListProps {
  refreshKey: number
}

export const PreparingOrdersList = ({ refreshKey }: PreparingOrdersListProps) => {
  const [page, setPage] = useState(1)
  const { orders, pagination, loading, error, refetch } = useKdsOrders(
    'En preparación',
    PAGE_SIZE,
    page,
    refreshKey
  )

  return (
    <section aria-labelledby='preparing-orders-title' className='min-w-0'>
      <header className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <h2 className='text-lg font-semibold tracking-tight text-neutral sm:text-xl' id='preparing-orders-title'>
            En mesa de corte
          </h2>
          {pagination && (
            <span className='inline-flex min-w-7 items-center justify-center rounded-full bg-[#ffdec2] px-2 py-1 text-sm font-bold text-[#4d2a00]'>
              {pagination.total}
            </span>
          )}
        </div>
        {pagination && pagination.totalPages > 1 && (
          <p className='text-xs text-neutral/70'>Página {pagination.page} de {pagination.totalPages}</p>
        )}
      </header>

      {loading && orders.length === 0 && (
        <div aria-label='Cargando pedidos en preparación' aria-live='polite' className='space-y-3'>
          {[0, 1].map((item) => (
            <div className='animate-pulse rounded-2xl border border-white/80 bg-white/90 p-4' key={item}>
              <div className='h-5 w-32 rounded bg-[#eadbcd]' />
              <div className='mt-4 h-20 rounded-xl bg-[#fbf2e9]' />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className='mb-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4' role='alert'>
          <p className='flex items-start gap-2 text-sm font-medium text-primary'>
            <FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />
            <span>
              {error}
              {orders.length > 0 && pagination && (
                <span className='font-normal'> Se conservan los resultados de la página {pagination.page}.</span>
              )}
            </span>
          </p>
          <button
            className='mt-3 inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0'
            disabled={loading}
            onClick={refetch}
            type='button'
          >
            <FiRefreshCw aria-hidden='true' />
            Volver a consultar
          </button>
        </div>
      )}

      {loading && orders.length > 0 && (
        <p aria-live='polite' className='mb-3 text-sm text-neutral/70' role='status'>Actualizando pedidos en preparación…</p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className='flex min-h-40 flex-col items-center justify-center rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-6 text-center'>
          <FiClipboard aria-hidden='true' className='text-2xl text-secondary' />
          <p className='mt-3 font-semibold text-neutral'>No hay pedidos en preparación</p>
          <p className='mt-1 text-sm text-neutral/80'>Los pedidos aparecerán aquí cuando comiencen a prepararse.</p>
        </div>
      )}

      {orders.length > 0 && (
        <div aria-busy={loading} aria-live='polite' className='space-y-3'>
          {orders.map((order) => <PreparingOrderCard key={order.uuid} order={order} />)}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <nav aria-label='Paginación de pedidos en preparación' className='mt-4 flex items-center justify-between gap-3'>
          <button
            className='min-h-10 rounded-xl border border-[#eadbcd] bg-white px-4 text-sm font-semibold text-neutral transition hover:bg-[#fbf2e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'
            disabled={loading || page <= 1}
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            type='button'
          >
            Anterior
          </button>
          <span className='font-label text-xs tabular-nums text-neutral/75'>
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            className='min-h-10 rounded-xl border border-[#eadbcd] bg-white px-4 text-sm font-semibold text-neutral transition hover:bg-[#fbf2e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'
            disabled={loading || page >= pagination.totalPages}
            onClick={() => setPage((currentPage) => Math.min(currentPage + 1, pagination.totalPages))}
            type='button'
          >
            Siguiente
          </button>
        </nav>
      )}
    </section>
  )
}
