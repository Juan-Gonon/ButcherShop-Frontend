import type { DashboardPeriod } from '../types/dashboard'

interface DashboardHeaderProps {
  userName?: string
  period: DashboardPeriod
  onPeriodChange: (period: DashboardPeriod) => void
}

const periods: { value: DashboardPeriod; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'ayer', label: 'Ayer' }
]

export const DashboardHeader = ({
  userName,
  period,
  onPeriodChange
}: DashboardHeaderProps) => (
  <header className='flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
    <div>
      <p className='text-sm font-semibold uppercase tracking-[0.16em] text-secondary'>
        Panel de control
      </p>
      <h1 className='mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl'>
        Hola{userName ? `, ${userName}` : ''}
      </h1>
      <p className='mt-2 text-sm text-stone-600'>Resumen de pedidos entregados</p>
    </div>

    <div className='flex flex-wrap items-center gap-3'>
      <div
        aria-label='Período del resumen'
        className='inline-flex rounded-xl border border-stone-200 bg-white p-1 shadow-sm'
        role='group'
      >
        {periods.map((option) => (
          <button
            aria-pressed={period === option.value}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              period === option.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
            key={option.value}
            onClick={() => onPeriodChange(option.value)}
            type='button'
          >
            {option.label}
          </button>
        ))}
      </div>
      <button
        className='rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary'
        onClick={() => console.log('Nuevo pedido')}
        type='button'
      >
        + Nuevo pedido
      </button>
    </div>
  </header>
)
