import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: ReactNode
  icon: ReactNode
  detail?: string
  valueClassName?: string
  accent: 'wine' | 'green' | 'ochre' | 'neutral'
}

const accentStyles = {
  wine: { surface: 'bg-primary/5', icon: 'bg-primary/10 text-primary', value: 'text-primary' },
  green: { surface: 'bg-secondary/5', icon: 'bg-secondary/10 text-secondary', value: 'text-secondary' },
  ochre: { surface: 'bg-tertiary/45', icon: 'bg-tertiary text-primary', value: 'text-neutral' },
  neutral: { surface: 'bg-bg-light/55', icon: 'bg-white/80 text-neutral', value: 'text-neutral' }
}

export const MetricCard = ({
  label,
  value,
  icon,
  detail,
  valueClassName,
  accent
}: MetricCardProps) => (
  <article className={`group flex min-h-44 min-w-0 flex-col rounded-3xl border border-white/90 p-4 shadow-[0_4px_20px_-5px_rgba(92,77,60,0.10)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(92,77,60,0.16)] sm:min-h-48 sm:p-5 ${accentStyles[accent].surface}`}>
    <div className='flex items-center gap-3'>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${accentStyles[accent].icon}`}>
        {icon}
      </span>
      <div className='min-w-0 flex-1'>
        <h2 className='truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral sm:text-xs'>{label}</h2>
        {detail && <p className='mt-1 line-clamp-2 text-xs leading-4 text-neutral/90'>{detail}</p>}
      </div>
    </div>
    <div className={`mt-auto min-w-0 break-words pt-5 font-label font-semibold tabular-nums tracking-tight ${accentStyles[accent].value} ${valueClassName ?? 'text-2xl sm:text-3xl'}`}>
      {value}
    </div>
  </article>
)
