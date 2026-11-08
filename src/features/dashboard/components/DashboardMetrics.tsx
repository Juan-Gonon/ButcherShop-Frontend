import type { ReactNode } from 'react'
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
  <div className='rounded-2xl border border-stone-200 bg-white p-6 text-sm text-stone-600 shadow-sm'>
    {children}
  </div>
)

export const DashboardMetrics = ({ data, status, error, onRetry }: DashboardMetricsProps) => {
  if (status === 'loading') {
    return (
      <div aria-label='Cargando indicadores' aria-live='polite' className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {['Ventas', 'Pedidos entregados', 'Ticket promedio', 'Volumen vendido'].map((label) => (
          <div className='h-36 animate-pulse rounded-2xl border border-stone-200 bg-white p-5' key={label}>
            <div className='h-4 w-2/3 rounded bg-stone-200' />
            <div className='mt-6 h-8 w-1/2 rounded bg-stone-100' />
          </div>
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <StatePanel>
        <p className='font-semibold text-red-800'>{error ?? 'Ocurrió un error al consultar los indicadores.'}</p>
        <button className='mt-4 rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90' onClick={onRetry} type='button'>
          Reintentar
        </button>
      </StatePanel>
    )
  }

  if (status === 'empty' && data) {
    return (
      <StatePanel>
        <p className='font-semibold text-stone-800'>Sin datos para este período</p>
        <p className='mt-1'>No se encontraron pedidos entregados en el intervalo consultado.</p>
        <div className='mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          <MetricCard label='Ventas' value={formatMoney(data.total_vendido)} />
          <MetricCard label='Pedidos entregados' value={formatNumber(data.pedidos_entregados)} />
          <MetricCard label='Ticket promedio' value={formatMoney(data.ticket_promedio)} />
          <MetricCard label='Volumen vendido' value='Sin volumen' />
        </div>
      </StatePanel>
    )
  }

  if (!data) return null

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      <MetricCard accent='wine' detail='Pedidos entregados en el período' label='Ventas' value={formatMoney(data.total_vendido)} />
      <MetricCard accent='green' detail='Pedidos con estado Entregado' label='Pedidos entregados' value={formatNumber(data.pedidos_entregados)} />
      <MetricCard accent='ochre' detail='Promedio por pedido entregado' label='Ticket promedio' value={formatMoney(data.ticket_promedio)} />
      <MetricCard
        accent='neutral'
        label='Volumen vendido'
        value={
          data.volumen_vendido.length > 0 ? (
            <ul className='space-y-2'>
              {data.volumen_vendido.map((item) => (
                <li className='flex items-baseline justify-between gap-3 text-base' key={`${item.unidad_venta}-${item.abreviatura}`}>
                  <span className='truncate text-sm font-medium text-stone-600'>{item.unidad_venta}</span>
                  <span className='shrink-0 font-semibold text-stone-900'>
                    {formatNumber(item.cantidad)} <span className='text-xs font-medium text-stone-500'>{item.abreviatura}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : <span className='text-base font-medium text-stone-500'>Sin volumen</span>
        }
      />
    </div>
  )
}
