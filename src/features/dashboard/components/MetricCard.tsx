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
  <article className={`group flex min-h-28 min-w-0 items-center gap-3 rounded-2xl border border-white/90 p-3.5 shadow-[0_4px_20px_-5px_rgba(92,77,60,0.10)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(92,77,60,0.16)] sm:min-h-32 sm:p-4 ${accentStyles[accent].surface}`}>
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${accentStyles[accent].icon}`}>
      {icon}
    </span>
    <div className='min-w-0 flex-1'>
      <h2 className='truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral sm:text-xs'>{label}</h2>
      {detail && <p className='mt-1 line-clamp-2 text-xs leading-4 text-neutral/90'>{detail}</p>}
      <div className={`mt-1.5 min-w-0 break-words font-label font-semibold tabular-nums tracking-tight ${accentStyles[accent].value} ${valueClassName ?? 'text-xl sm:text-2xl'}`}>
        {value}
      </div>
    </div>
  </article>
)
