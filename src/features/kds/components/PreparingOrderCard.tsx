import { FiClock, FiShoppingBag } from 'react-icons/fi'
import type { FinishPreparationResult } from '../hooks/useFinishPreparation'
import type { KdsPreparingOrder } from '../types/kds'

interface PreparingOrderCardProps {
  order: KdsPreparingOrder
  checkedDetailIds: ReadonlySet<string>
  progress: {
    total: number
    completed: number
    percentage: number
  }
  onToggleDetail: (detailId: string) => void
  finishLoading: boolean
  transitionError: string | null
  refreshError: string | null
  transitionSucceeded: boolean
  onFinishPreparation: () => Promise<FinishPreparationResult | null>
}

const businessDateTime = new Intl.DateTimeFormat('es-GT', {
  timeZone: 'America/Guatemala',
  dateStyle: 'medium',
  timeStyle: 'short'
})

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : businessDateTime.format(date)
}

export const PreparingOrderCard = ({
  order,
  checkedDetailIds,
  progress,
  onToggleDetail
}: PreparingOrderCardProps) => (
  <article className='flex min-w-0 flex-col gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm sm:p-5'>
    <div className='flex min-w-0 flex-wrap items-start justify-between gap-3'>
      <div className='min-w-0'>
        <p className='font-label text-lg font-bold text-primary'>#{order.id_pedido}</p>
        <h3 className='mt-1 break-words text-base font-semibold text-neutral sm:text-lg'>
          {order.cliente.nombre}
        </h3>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary'>
          {order.tipo_entrega}
        </span>
        <p className='inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#f6ece3] px-2.5 py-1.5 text-xs text-neutral/80'>
          <FiClock aria-hidden='true' />
          <time dateTime={order.fecha}>{formatDateTime(order.fecha)}</time>
        </p>
      </div>
    </div>

    <section aria-label={`Checklist de preparación del pedido ${order.id_pedido}`} className='space-y-2'>
      <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm font-semibold text-neutral'>
        <p aria-live='polite'>
          {progress.completed} de {progress.total} detalles preparados — {progress.percentage} %
        </p>
        {progress.total > 0 && progress.completed === progress.total && (
          <p className='text-secondary' role='status'>Checklist completado</p>
        )}
      </div>
      <div
        aria-label={`Progreso del checklist del pedido ${order.id_pedido}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress.percentage}
        className='h-2 overflow-hidden rounded-full bg-[#eadbcd]'
        role='progressbar'
      >
        <div
          className='h-full rounded-full bg-secondary transition-[width] duration-200'
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <p className='text-xs text-neutral/70'>El checklist es visual y no modifica el estado ni confirma la entrega.</p>
    </section>

    <div className='rounded-xl bg-[#fbf2e9] p-3'>
      <p className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral/70'>
        <FiShoppingBag aria-hidden='true' className='text-secondary' />
        Productos ({order.detalles.length})
      </p>
      {order.detalles.length > 0 ? (
        <ul className='mt-2.5 space-y-3'>
          {order.detalles.map((detail, index) => (
            <li className='min-w-0 border-t border-[#eadbcd] pt-2.5 first:border-0 first:pt-0' key={detail.id_detalle_pedido}>
              <label className='flex min-h-12 min-w-0 cursor-pointer items-start gap-3 rounded-lg p-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary'>
                <input
                  aria-label={`Preparado: detalle ${index + 1}, ${detail.cantidad} ${detail.unidad} ${detail.producto}`}
                  checked={checkedDetailIds.has(detail.id_detalle_pedido)}
                  className='mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                  onChange={() => onToggleDetail(detail.id_detalle_pedido)}
                  type='checkbox'
                />
                <span className='min-w-0 flex-1'>
                  <span className='block break-words text-sm font-semibold text-neutral'>
                    <span className='tabular-nums'>{detail.cantidad} {detail.unidad}</span>{' '}
                    {detail.producto}
                  </span>
                  {detail.preparacion?.trim() && (
                    <span className='mt-1 block break-words text-sm text-primary'>Preparación: {detail.preparacion}</span>
                  )}
                  {detail.observaciones?.trim() && (
                    <span className='mt-1 block break-words text-sm text-neutral/75'>{detail.observaciones}</span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p className='mt-2 text-sm text-neutral/70'>Sin productos registrados.</p>
      )}
    </div>
  </article>
)
