import { LuClipboardList, LuTrash2 } from 'react-icons/lu'
import { CartLineItem } from './CartLineItem'
import type { CartSummary } from '../types/cart'
import type { Preparation, PreparationsStatus } from '../types/preparation'

interface CurrentOrderSummaryProps {
  summary: CartSummary
  validationError: string | null
  preparations: Preparation[]
  preparationsStatus: PreparationsStatus
  onRetryPreparations: () => void
  onClearError: () => void
  onCancelOrder: () => void
  onQuantityChange: (lineId: string, quantity: number) => void
  onPreparationChange: (
    lineId: string,
    preparation: Preparation | null
  ) => void
  onObservationsChange: (lineId: string, observations: string | null) => void
  onRemoveLine: (lineId: string) => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2
  }).format(value)

export const CurrentOrderSummary = ({
  summary,
  validationError,
  preparations,
  preparationsStatus,
  onRetryPreparations,
  onClearError,
  onCancelOrder,
  onQuantityChange,
  onPreparationChange,
  onObservationsChange,
  onRemoveLine
}: CurrentOrderSummaryProps) => (
  <section
    aria-labelledby='current-order-title'
    className='min-w-0 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_4px_20px_-2px_rgba(92,77,60,0.06)] sm:p-5'
  >
    <header className='flex min-w-0 items-center justify-between gap-3'>
      <div className='flex min-w-0 items-center gap-2.5'>
        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
          <LuClipboardList aria-hidden='true' className='h-5 w-5' />
        </span>
        <div className='min-w-0'>
          <h2 id='current-order-title' className='text-base font-semibold text-neutral'>
            Pedido actual
          </h2>
          <p className='text-xs text-stone-500'>
            {summary.lineCount} {summary.lineCount === 1 ? 'línea' : 'líneas'}
          </p>
        </div>
      </div>
      {(summary.lineCount > 0 || validationError) && (
        <button
          type='button'
          onClick={onCancelOrder}
          className='inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 sm:px-3 sm:text-sm'
        >
          <LuTrash2 aria-hidden='true' className='h-4 w-4' />
          Cancelar pedido
        </button>
      )}
    </header>

    {validationError && (
      <div className='mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-100 bg-red-50/70 p-3'>
        <p role='alert' className='text-sm text-red-700'>{validationError}</p>
        <button
          type='button'
          onClick={onClearError}
          aria-label='Cerrar mensaje de error'
          className='shrink-0 text-xs font-semibold text-red-700 underline'
        >
          Cerrar
        </button>
      </div>
    )}

    {preparationsStatus === 'error' && summary.lineCount > 0 && (
      <div className='mt-4 flex flex-col gap-2 rounded-xl bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-xs text-amber-900'>No se pudieron cargar preparaciones para editar las líneas.</p>
        <button
          type='button'
          onClick={onRetryPreparations}
          className='shrink-0 text-left text-xs font-semibold text-amber-900 underline sm:text-right'
        >
          Reintentar
        </button>
      </div>
    )}

    {preparationsStatus === 'loading' && summary.lineCount > 0 && (
      <p className='mt-3 text-xs text-stone-500' role='status'>Cargando opciones de preparación…</p>
    )}

    {summary.lineCount === 0 ? (
      <div className='rounded-xl border border-dashed border-neutral/20 bg-white/45 px-4 py-8 text-center sm:mt-4'>
        <p className='text-sm font-medium text-neutral'>Aún no hay productos en el pedido.</p>
        <p className='mt-1 text-xs text-stone-500'>Selecciona un producto del catálogo para comenzar.</p>
      </div>
    ) : (
      <>
        <div className='mt-4 flex min-w-0 flex-col gap-3'>
          {summary.lines.map((line) => (
            <CartLineItem
              key={line.lineId}
              line={line}
              preparations={preparations}
              preparationsStatus={preparationsStatus}
              onQuantityChange={onQuantityChange}
              onPreparationChange={onPreparationChange}
              onObservationsChange={onObservationsChange}
              onRemove={onRemoveLine}
            />
          ))}
        </div>
        <footer className='mt-4 flex items-center justify-between gap-3 border-t border-stone-200 pt-4'>
          <span className='text-sm font-semibold text-stone-700'>Total del pedido</span>
          <span className='shrink-0 text-xl font-bold text-primary sm:text-2xl'>
            {formatCurrency(summary.total)}
          </span>
        </footer>
      </>
    )}
  </section>
)
