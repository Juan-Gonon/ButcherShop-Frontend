import type { DashboardPeriod } from '../types/dashboard'
import { FiCalendar, FiPlus, FiShoppingBag } from 'react-icons/fi'

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
  <header className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
    <div className='flex min-w-0 items-center gap-3'>
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-lg text-white shadow-[0_6px_14px_-5px_rgba(139,30,46,0.55)] sm:h-11 sm:w-11'>
        <FiShoppingBag aria-hidden='true' />
      </div>
      <div className='min-w-0'>
        <p className='font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary'>Panel principal</p>
        <h1 className='mt-0.5 truncate text-xl font-semibold tracking-tight text-neutral sm:text-2xl'>
          ¡Bienvenido{userName ? `, ${userName}` : ''}!
        </h1>
        <p className='mt-0.5 text-xs text-neutral sm:text-sm'>Carnicería El Corte de Oro · Resumen operativo</p>
      </div>
    </div>

    <div className='flex flex-row gap-2 sm:gap-3 lg:justify-end'>
      <div aria-label='Período del resumen' className='flex min-w-0 flex-1 rounded-xl bg-bg-light/70 p-1 sm:flex-none' role='group'>
        {periods.map((option) => (
          <button
            aria-pressed={period === option.value}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition sm:flex-none sm:px-3.5 ${
              period === option.value
                ? 'bg-white text-primary shadow-[0_2px_8px_rgba(92,77,60,0.12)]'
                : 'text-neutral hover:bg-white/60 hover:text-primary'
            }`}
            key={option.value}
            onClick={() => onPeriodChange(option.value)}
            type='button'
          >
            {option.value === 'hoy' && <FiCalendar aria-hidden='true' className='text-[15px]' />}
            {option.label}
          </button>
        ))}
      </div>
      <button
        className='inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-[0_5px_14px_-5px_rgba(139,30,46,0.55)] transition hover:-translate-y-0.5 hover:bg-primary/95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 sm:text-sm'
        onClick={() => console.log('Nuevo pedido')}
        type='button'
      >
        <FiPlus aria-hidden='true' className='text-base' />
        Nuevo pedido
      </button>
    </div>
  </header>
)
