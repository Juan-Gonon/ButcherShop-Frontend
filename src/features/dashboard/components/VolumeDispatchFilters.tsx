import type { VolumeDispatchPeriod, VolumeDispatchUnit } from '../types/volumeDispatch'

interface VolumeDispatchFiltersProps {
  period: VolumeDispatchPeriod
  unit: VolumeDispatchUnit
  onPeriodChange: (period: VolumeDispatchPeriod) => void
  onUnitChange: (unit: VolumeDispatchUnit) => void
}

const periodOptions: Array<{ label: string; value: VolumeDispatchPeriod }> = [
  { label: 'Hoy', value: 'hoy' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mes', value: 'mes' }
]

const unitOptions: Array<{ label: string; value: VolumeDispatchUnit }> = [
  { label: 'lb', value: 'lb' },
  { label: 'kg', value: 'kg' }
]

const SegmentGroup = <T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: T
  options: Array<{ label: string; value: T }>
  onChange: (value: T) => void
}) => (
    <div aria-label={label} className='flex rounded-xl bg-bg-light/55 p-1' role='group'>
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            aria-pressed={selected}
            className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected ? 'bg-white text-primary shadow-sm' : 'text-neutral hover:text-primary'}`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type='button'
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )

export const VolumeDispatchFilters = ({ period, unit, onPeriodChange, onUnitChange }: VolumeDispatchFiltersProps) => (
  <div className='flex flex-wrap items-center gap-2'>
    <SegmentGroup label='Filtrar por período' onChange={onPeriodChange} options={periodOptions} value={period} />
    <SegmentGroup label='Unidad de medida' onChange={onUnitChange} options={unitOptions} value={unit} />
  </div>
)
