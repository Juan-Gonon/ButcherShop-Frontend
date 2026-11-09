import {
  FiClock,
  FiMapPin,
  FiMessageCircle,
  FiPackage,
  FiShoppingBag
} from 'react-icons/fi'
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
  if (normalized === 'en preparación' || normalized === 'en preparacion') {
    return 'bg-tertiary/35 text-amber-900 ring-tertiary/50'
  }
  if (normalized === 'pendiente') return 'bg-primary/8 text-primary ring-primary/15'
  if (normalized === 'listo' || normalized === 'listo entrega') {
    return 'bg-secondary/10 text-secondary ring-secondary/20'
  }
  return 'bg-bg-light/80 text-neutral ring-bg-light'
}

const summarizeDetails = (order: LiveOrder) => {
  const visibleDetails = order.detalles.slice(0, 3)
  const remainingCount = order.detalles.length - visibleDetails.length

  return { visibleDetails, remainingCount }
}

export const LiveOrderCard = ({ order }: LiveOrderCardProps) => {
  const { visibleDetails, remainingCount } = summarizeDetails(order)

  return (
    <article className='flex h-full min-h-[19rem] w-[min(86vw,22rem)] shrink-0 flex-col rounded-2xl border border-bg-light/80 bg-[#fbf5ef] p-4 shadow-sm transition-shadow hover:shadow-md sm:w-[22rem] sm:p-5'>
      <div className='flex min-w-0 items-start justify-between gap-3 border-b border-bg-light/80 pb-3'>
        <div className='min-w-0'>
          <p className='font-label text-xs font-bold tracking-wide text-primary'>#{order.id_pedido}</p>
          <h3 className='mt-1 truncate text-sm font-semibold text-neutral sm:text-base' title={order.cliente}>{order.cliente}</h3>
          <div className='mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral/80'>
            <span className='inline-flex min-w-0 items-center gap-1.5'>
              <FiMessageCircle aria-hidden='true' className='shrink-0 text-secondary' />
              <span className='truncate'>{order.canal_origen}</span>
            </span>
            <span aria-hidden='true' className='text-neutral/40'>·</span>
            <span className='inline-flex min-w-0 items-center gap-1.5'>
              <FiMapPin aria-hidden='true' className='shrink-0 text-primary/75' />
              <span className='truncate'>{order.tipo_entrega}</span>
            </span>
          </div>
        </div>
        <span className={`max-w-32 shrink-0 rounded-full px-2.5 py-1 text-center text-[10px] font-semibold leading-tight ring-1 ring-inset sm:text-[11px] ${getStatusClassName(order.estado)}`}>
          {order.estado}
        </span>
      </div>

      <div className='mt-3 flex items-center gap-2 text-xs text-neutral/75'>
        <FiClock aria-hidden='true' className='shrink-0 text-neutral/60' />
        <time dateTime={order.fecha}>{formatDate(order.fecha)}</time>
      </div>

      <div className='mt-3 min-w-0 flex-1 rounded-xl border border-white/80 bg-white/80 p-3'>
        <p className='flex items-center gap-1.5 font-label text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral/70'>
          <FiShoppingBag aria-hidden='true' className='text-secondary' /> Detalle del pedido
        </p>
        {order.detalles.length > 0 ? (
          <ul className='mt-2.5 space-y-2'>
            {visibleDetails.map((detail, index) => (
              <li className='flex min-w-0 items-start justify-between gap-2 text-xs sm:text-sm' key={`${order.uuid}-${index}`}>
                <span className='flex min-w-0 items-start gap-2 text-neutral'>
                  <FiPackage aria-hidden='true' className='mt-0.5 shrink-0 text-secondary/80' />
                  <span className='min-w-0 break-words'>
                    <span className='font-semibold tabular-nums'>{detail.cantidad} {detail.unidad}</span>{' '}
                    {detail.producto}
                  </span>
                </span>
                <span className='max-w-[42%] shrink-0 break-words rounded-md bg-tertiary/20 px-1.5 py-1 text-right text-[10px] font-medium leading-tight text-neutral/85 sm:text-xs'>
                  {detail.preparacion}
                </span>
              </li>
            ))}
            {remainingCount > 0 && (
              <li className='pl-6 pt-0.5 text-[11px] font-medium text-neutral/70'>+{remainingCount} {remainingCount === 1 ? 'línea más' : 'líneas más'}</li>
            )}
          </ul>
        ) : (
          <p className='mt-2 text-xs text-neutral/70'>Sin detalles de productos.</p>
        )}
      </div>

      <div className='mt-3 flex items-end justify-between gap-3 border-t border-bg-light/80 pt-3'>
        <span className='text-xs font-medium text-neutral/75'>Total del pedido</span>
        <span className='break-words text-right font-label text-lg font-bold tabular-nums tracking-tight text-neutral'>{formatMoney(order.total)}</span>
      </div>
    </article>
  )
}