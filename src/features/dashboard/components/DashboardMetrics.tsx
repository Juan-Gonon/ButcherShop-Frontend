import type { ReactNode } from 'react'
import { FiAlertCircle, FiCheckCircle, FiDollarSign, FiPackage, FiShoppingCart, FiTag } from 'react-icons/fi'
import { MetricCard } from './MetricCard'
import type { DashboardSummaryData } from '../types/dashboard'

interface DashboardMetricsProps {
  data: DashboardSummaryData | null
  status: 'loading' | 'error' | 'empty' | 'success'
  error: string | null
  onRetry: () => void
}

const formatNumber = (value: string, maximumFractionDigits = 20) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return value

  return new Intl.NumberFormat('es-GT', {
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits === 2 ? 2 : 0
  }).format(number)
}

const formatMoney = (value: string) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return value

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)
}

const StatePanel = ({ children }: { children: ReactNode }) => (
  <div className='rounded-2xl border border-white/90 bg-white/80 p-3.5 text-sm text-neutral shadow-[0_4px_20px_-5px_rgba(92,77,60,0.10)] sm:p-4'>
    {children}
  </div>
)

export const DashboardMetrics = ({ data, status, error, onRetry }: DashboardMetricsProps) => {
  if (status === 'loading') {
    return (
      <div aria-label='Cargando indicadores' aria-live='polite' className='grid gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4'>
        {['Ventas', 'Pedidos entregados', 'Ticket promedio', 'Volumen vendido'].map((label) => (
          <div className='flex h-28 animate-pulse items-center gap-3 rounded-2xl border border-white/90 bg-bg-light/45 p-3.5 sm:h-32 sm:p-4' key={label}>
            <div className='h-10 w-10 shrink-0 rounded-xl bg-secondary/10' />
            <div className='min-w-0 flex-1'>
              <div className='h-3 w-2/3 rounded bg-bg-light' />
              <div className='mt-3 h-6 w-1/2 rounded bg-white/80' />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <StatePanel>
        <div className='flex items-start gap-3'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg text-primary'><FiAlertCircle aria-hidden='true' /></span>
          <div>
            <p className='font-semibold text-primary'>{error ?? 'Ocurrió un error al consultar los indicadores.'}</p>
            <button className='mt-3 rounded-lg bg-primary px-3.5 py-2 font-semibold text-white transition hover:bg-primary/90' onClick={onRetry} type='button'>
              Reintentar consulta
            </button>
          </div>
        </div>
      </StatePanel>
    )
  }

  if (status === 'empty' && data) {
    return (
      <StatePanel>
        <div className='flex items-center gap-3'>
          <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-lg text-secondary'><FiCheckCircle aria-hidden='true' /></span>
          <div>
            <p className='font-semibold text-neutral'>Sin pedidos entregados en este período</p>
            <p className='mt-1'>La consulta respondió correctamente; los indicadores muestran los valores recibidos.</p>
          </div>
        </div>
        <div className='mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4'>
          <MetricCard accent='wine' icon={<FiDollarSign />} label='Ventas' value={formatMoney(data.total_vendido)} />
          <MetricCard accent='green' icon={<FiShoppingCart />} label='Pedidos entregados' value={formatNumber(data.pedidos_entregados)} />
          <MetricCard accent='ochre' icon={<FiTag />} label='Ticket promedio' value={formatMoney(data.ticket_promedio)} />
          <MetricCard accent='neutral' icon={<FiPackage />} label='Volumen vendido' value='Sin volumen' />
        </div>
      </StatePanel>
    )
  }

  if (!data) return null

  return (
    <div className='grid gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4'>
      <MetricCard accent='green' detail='Entregado en el período' icon={<FiDollarSign />} label='Ventas' value={formatMoney(data.total_vendido)} />
      <MetricCard accent='ochre' detail='Con estado Entregado' icon={<FiCheckCircle />} label='Pedidos entregados' value={formatNumber(data.pedidos_entregados)} />
      <MetricCard accent='wine' detail='Promedio por pedido entregado' icon={<FiTag />} label='Ticket promedio' value={formatMoney(data.ticket_promedio)} />
      <MetricCard
        accent='neutral'
        icon={<FiPackage />}
        label='Volumen vendido'
        valueClassName='w-full text-sm font-normal sm:text-base'
        value={
          data.volumen_vendido.length > 0 ? (
            <ul className='space-y-1'>
              {data.volumen_vendido.map((item) => (
                <li className='flex items-baseline justify-between gap-3 text-base' key={`${item.unidad_venta}-${item.abreviatura}`}>
                  <span className='min-w-0 truncate text-sm font-medium text-neutral'>{item.unidad_venta}</span>
                  <span className='shrink-0 font-semibold text-neutral'>
                    {formatNumber(item.cantidad)} <span className='font-label text-[11px] font-medium text-neutral'>{item.abreviatura}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : <span className='text-sm font-medium text-neutral'>Sin volumen</span>
        }
      />
    </div>
  )
}
