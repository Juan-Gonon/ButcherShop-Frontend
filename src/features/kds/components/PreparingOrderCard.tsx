import { FiClock, FiShoppingBag } from 'react-icons/fi'
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

export const PreparingOrderCard = ({ order }: PreparingOrderCardProps) => (
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

    <div className='rounded-xl bg-[#fbf2e9] p-3'>
      <p className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral/70'>
        <FiShoppingBag aria-hidden='true' className='text-secondary' />
        Productos ({order.detalles.length})
      </p>
      {order.detalles.length > 0 ? (
        <ul className='mt-2.5 space-y-3'>
          {order.detalles.map((detail) => (
            <li className='min-w-0 border-t border-[#eadbcd] pt-2.5 first:border-0 first:pt-0' key={detail.id_detalle_pedido}>
              <p className='break-words text-sm font-semibold text-neutral'>
                <span className='tabular-nums'>{detail.cantidad} {detail.unidad}</span>{' '}
                {detail.producto}
              </p>
              {detail.preparacion?.trim() && (
                <p className='mt-1 break-words text-sm text-primary'>Preparación: {detail.preparacion}</p>
              )}
              {detail.observaciones?.trim() && (
                <p className='mt-1 break-words text-sm text-neutral/75'>{detail.observaciones}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className='mt-2 text-sm text-neutral/70'>Sin productos registrados.</p>
      )}
    </div>
  </article>
)
