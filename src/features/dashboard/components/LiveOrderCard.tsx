import { FiClock, FiMapPin, FiPackage, FiShoppingBag } from 'react-icons/fi'
import type { LiveOrder } from '../types/liveOrders'

interface LiveOrderCardProps {
  order: LiveOrder
}

const businessDateTime = new Intl.DateTimeFormat('es-GT', {
  timeZone: 'America/Guatemala',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit'
})

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : businessDateTime.format(date)
}

const formatMoney = (value: string) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return value

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const getStatusClassName = (status: string) => {
  const normalized = status.trim().toLocaleLowerCase('es-GT')

  if (normalized === 'confirmado') return 'bg-blue-50 text-blue-700 ring-blue-200'
  if (normalized === 'en camino') return 'bg-secondary/10 text-secondary ring-secondary/20'
  if (normalized === 'en preparaciÃ³n' || normalized === 'en preparacion') {
    return 'bg-tertiary/45 text-neutral ring-tertiary'
  }
  if (normalized === 'pendiente') return 'bg-amber-50 text-amber-800 ring-amber-200'
  return 'bg-stone-100 text-stone-700 ring-stone-200'
}

const summarizeDetails = (order: LiveOrder) => {
  const visibleDetails = order.detalles.slice(0, 3)
  const remainingCount = order.detalles.length - visibleDetails.length

  return { visibleDetails, remainingCount }
}

export const LiveOrderCard = ({ order }: LiveOrderCardProps) => {
  const { visibleDetails, remainingCount } = summarizeDetails(order)

  return (
    <article className='flex h-full min-h-72 w-[min(84vw,21rem)] shrink-0 flex-col rounded-2xl border border-bg-light/80 bg-white p-4 shadow-[0_8px_24px_-16px_rgba(92,77,60,0.24)] sm:w-80 sm:p-5'>
      <div className='flex min-w-0 items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='font-label text-xs font-semibold tracking-wide text-primary'>Pedido #{order.id_pedido}</p>
          <h3 className='mt-1 break-words text-base font-semibold text-neutral'>{order.cliente}</h3>
        </div>
        <span className={`max-w-32 shrink-0 rounded-full px-2.5 py-1 text-center text-[11px] font-semibold ring-1 ring-inset ${getStatusClassName(order.estado)}`}>
          {order.estado}
        </span>
      </div>

      <div className='mt-4 grid grid-cols-2 gap-2 text-xs text-neutral'>
        <p className='flex min-w-0 items-center gap-2 rounded-xl bg-bg-light/45 px-2.5 py-2'>
          <FiMapPin aria-hidden='true' className='shrink-0 text-primary' />
          <span className='truncate'>{order.tipo_entrega}</span>
        </p>
        <p className='flex min-w-0 items-center gap-2 rounded-xl bg-bg-light/45 px-2.5 py-2'>
          <FiClock aria-hidden='true' className='shrink-0 text-primary' />
          <time className='truncate' dateTime={order.fecha}>{formatDate(order.fecha)}</time>
        </p>
      </div>

      <div className='mt-4 min-w-0 flex-1'>
        <p className='flex items-center gap-2 font-label text-[10px] font-medium uppercase tracking-[0.12em] text-neutral/80'>
          <FiShoppingBag aria-hidden='true' /> Productos
        </p>
        {order.detalles.length > 0 ? (
          <ul className='mt-2 space-y-2'>
            {visibleDetails.map((detail, index) => (
              <li className='flex min-w-0 items-start gap-2 text-sm text-neutral' key={`${order.uuid}-${index}`}>
                <FiPackage aria-hidden='true' className='mt-0.5 shrink-0 text-secondary' />
                <span className='min-w-0 break-words'>
                  <span className='font-semibold tabular-nums'>{detail.cantidad} {detail.unidad}</span>{' '}
                  {detail.producto} Â· {detail.preparacion}
                </span>
              </li>
            ))}
            {remainingCount > 0 && (
              <li className='pl-6 text-xs font-medium text-neutral/75'>+{remainingCount} {remainingCount === 1 ? 'lÃ­nea mÃ¡s' : 'lÃ­neas mÃ¡s'}</li>
            )}
          </ul>
        ) : (
          <p className='mt-2 text-sm text-neutral/75'>Sin detalles de productos.</p>
        )}
      </div>

      <div className='mt-4 flex items-end justify-between gap-3 border-t border-bg-light/80 pt-3'>
        <span className='text-xs font-medium text-neutral'>Total</span>
        <span className='break-words text-right font-label text-base font-semibold tabular-nums text-secondary'>{formatMoney(order.total)}</span>
      </div>
    </article>
  )
}
