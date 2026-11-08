import type { ReactNode } from 'react'

interface MetricCardProps {
  label: string
  value: ReactNode
  detail?: string
  accent?: 'wine' | 'green' | 'ochre' | 'neutral'
}

const accentStyles = {
  wine: 'bg-primary/10 text-primary',
  green: 'bg-secondary/10 text-secondary',
  ochre: 'bg-amber-100 text-amber-800',
  neutral: 'bg-stone-100 text-stone-700'
}

export const MetricCard = ({
  label,
  value,
  detail,
  accent = 'wine'
}: MetricCardProps) => (
  <article className='min-w-0 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-6'>
    <div className='flex items-start justify-between gap-3'>
      <h2 className='text-sm font-medium text-stone-600'>{label}</h2>
      <span aria-hidden='true' className={`h-2.5 w-2.5 shrink-0 rounded-full ${accentStyles[accent]}`} />
    </div>
    <div className='mt-4 break-words text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl'>
      {value}
    </div>
    {detail && <p className='mt-2 text-xs text-stone-500'>{detail}</p>}
  </article>
)
