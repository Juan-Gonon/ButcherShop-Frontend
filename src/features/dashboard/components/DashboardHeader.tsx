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
  <header className='flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between'>
    <div className='flex min-w-0 items-center gap-4'>
      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl text-white shadow-[0_6px_14px_-5px_rgba(139,30,46,0.55)] sm:h-14 sm:w-14 sm:text-2xl'>
        <FiShoppingBag aria-hidden='true' />
      </div>
      <div className='min-w-0'>
        <p className='font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary'>Panel principal</p>
        <h1 className='mt-1 truncate text-2xl font-semibold tracking-tight text-neutral sm:text-3xl'>
          ¡Bienvenido{userName ? `, ${userName}` : ''}!
        </h1>
        <p className='mt-1 text-sm text-neutral'>Carnicería El Corte de Oro · Resumen operativo</p>
      </div>
    </div>

    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between xl:justify-end'>
      <div aria-label='Período del resumen' className='flex w-full rounded-2xl bg-bg-light/70 p-1 sm:w-auto' role='group'>
        {periods.map((option) => (
          <button
            aria-pressed={period === option.value}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:flex-none ${
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
        className='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_-5px_rgba(139,30,46,0.55)] transition hover:-translate-y-0.5 hover:bg-primary/95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-5'
        onClick={() => console.log('Nuevo pedido')}
        type='button'
      >
        <FiPlus aria-hidden='true' className='text-base' />
        Nuevo pedido
      </button>
    </div>
  </header>
)
