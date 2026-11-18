import { FiClock, FiLoader, FiMapPin, FiPhone, FiShoppingBag } from 'react-icons/fi'
import { useStartPreparation } from '../hooks/useStartPreparation'
import type { KdsConfirmedOrder } from '../types/kds'

interface ConfirmedOrderCardProps {
  order: KdsConfirmedOrder
  onStartPreparation: () => void
  onRefreshOrders: () => void
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

const getAddressText = (address: unknown): string | null => {
  if (typeof address !== 'string') return null
  const trimmedAddress = address.trim()
  return trimmedAddress.length > 0 ? trimmedAddress : null
}

const getDeliveryClassName = (deliveryType: KdsConfirmedOrder['tipo_entrega']) =>
  deliveryType === 'Recoger en tienda'
    ? 'bg-[#ffdec2] text-[#4d2a00]'
    : 'bg-[#b9ebcf] text-[#214f3b]'

export const ConfirmedOrderCard = ({ order, onStartPreparation, onRefreshOrders }: ConfirmedOrderCardProps) => {
  const { startPreparation, loading, error, started } = useStartPreparation()
  const address = getAddressText(order.direccion_envio)

  const handleStartPreparation = async () => {
    const succeeded = await startPreparation(order.uuid)
    if (succeeded) onStartPreparation()
  }

  return (
    <article className='flex min-w-0 flex-col gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm sm:p-5'>
      <div className='flex min-w-0 flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='font-label text-lg font-bold text-primary'>
              #{order.id_pedido}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getDeliveryClassName(order.tipo_entrega)}`}>
              {order.tipo_entrega}
            </span>
          </div>
          <h3 className='mt-1 break-words text-base font-semibold text-neutral sm:text-lg'>
            {order.cliente.nombre}
          </h3>
        </div>
        <p className='inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#f6ece3] px-2.5 py-1.5 text-xs text-neutral/80'>
          <FiClock aria-hidden='true' />
          <time dateTime={order.fecha}>{formatDateTime(order.fecha)}</time>
        </p>
      </div>

      {order.cliente.telefono && (
        <p className='flex items-center gap-2 text-sm text-neutral/80'>
          <FiPhone aria-hidden='true' className='shrink-0 text-secondary' />
          <span>{order.cliente.telefono}</span>
        </p>
      )}

      {address && (
        <p className='flex items-start gap-2 text-sm text-neutral/80'>
          <FiMapPin aria-hidden='true' className='mt-0.5 shrink-0 text-primary/75' />
          <span className='break-words'>{address}</span>
        </p>
      )}

      <div className='rounded-xl bg-[#fbf2e9] p-3'>
        <p className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral/70'>
          <FiShoppingBag aria-hidden='true' className='text-secondary' />
          Productos ({order.detalles.length})
        </p>
        {order.detalles.length > 0 ? (
          <ul className='mt-2.5 space-y-3'>
            {order.detalles.map((detail) => (
              <li
                className='min-w-0 border-t border-[#eadbcd] pt-2.5 first:border-0 first:pt-0'
                key={detail.id_detalle_pedido}
              >
                <p className='break-words text-sm font-semibold text-neutral'>
                  <span className='tabular-nums'>{detail.cantidad} {detail.unidad}</span>{' '}
                  {detail.producto}
                </p>
                {detail.preparacion && (
                  <p className='mt-1 text-sm text-primary'>
                    Preparación: {detail.preparacion}
                  </p>
                )}
                {typeof detail.observaciones === 'string' && detail.observaciones.trim().length > 0 && (
                  <p className='mt-1 break-words text-sm text-neutral/75'>
                    {detail.observaciones}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className='mt-2 text-sm text-neutral/70'>Sin productos registrados.</p>
        )}
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 border-t border-[#eadbcd] pt-3'>
        <span className='text-sm text-neutral/75'>Total del pedido</span>
        <span className='font-label text-lg font-bold tabular-nums text-neutral'>
          {formatMoney(order.total)}
        </span>
      </div>

      {error && (
        <div className='flex flex-wrap items-center justify-between gap-2' role='alert'>
          <p className='text-sm font-medium text-primary'>{error}</p>
          <button
            className='min-h-9 rounded-lg border border-primary/20 px-3 text-sm font-semibold text-primary transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            onClick={onRefreshOrders}
            type='button'
          >
            Actualizar pedidos
          </button>
        </div>
      )}
      <button
        className='inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-65'
        disabled={loading || started}
        onClick={handleStartPreparation}
        type='button'
      >
        {loading && <FiLoader aria-hidden='true' className='animate-spin' />}
        {started ? 'Preparaci\u00F3n iniciada' : loading ? 'Iniciando preparaci\u00F3n...' : 'Comenzar preparaci\u00F3n'}
      </button>
    </article>
  )
}
