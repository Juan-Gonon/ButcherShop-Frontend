import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { VolumeDispatchItem, VolumeDispatchUnit } from '../types/volumeDispatch'

interface VolumeDispatchChartProps {
  items: VolumeDispatchItem[]
  unit: VolumeDispatchUnit
}

const formatQuantity = (value: number) => new Intl.NumberFormat('es-GT', { maximumFractionDigits: 2 }).format(value)

interface ValueLabelProps {
  x?: number
  y?: number
  width?: number
  height?: number
  cantidad?: unknown
  porcentaje?: unknown
  value?: unknown
  payload?: unknown
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null ? value as Record<string, unknown> : null

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const ValueLabel = ({ entry, unit }: { entry: ValueLabelProps; unit: VolumeDispatchUnit }) => {
  const payload = asRecord(entry.payload)
  const payloadData = asRecord(payload?.payload)
  const value = asRecord(entry.value)
  const valueData = asRecord(value?.payload)
  const candidates = [entry, payload, payloadData, value, valueData]
  const quantity = candidates.find((candidate) => isFiniteNumber(candidate?.cantidad))?.cantidad
  const percentage = candidates.find((candidate) => isFiniteNumber(candidate?.porcentaje))?.porcentaje
    ?? (isFiniteNumber(entry.value) ? entry.value : undefined)

  if (!isFiniteNumber(quantity) && !isFiniteNumber(percentage)) return null

  const label = [
    isFiniteNumber(quantity) ? `${formatQuantity(quantity)} ${unit}` : null,
    isFiniteNumber(percentage) ? `${formatQuantity(percentage)}%` : null
  ].filter(Boolean).join(' · ')

  return (
    <text
      dominantBaseline='middle'
      fill='var(--color-neutral)'
      fontSize={11}
      fontWeight={600}
      textAnchor='start'
      x={(entry.x ?? 0) + (entry.width ?? 0) + 8}
      y={(entry.y ?? 0) + (entry.height ?? 0) / 2}
    >
      {label}
    </text>
  )
}

export const VolumeDispatchChart = ({ items, unit }: VolumeDispatchChartProps) => {
  const chartHeight = Math.max(120, items.length * 52)
  return (
    <div aria-label='Volumen despachado por tipo de carne' className='w-full min-w-0' role='img' style={{ height: chartHeight }}>
      <ResponsiveContainer height='100%' minWidth={0} width='100%'>
        <BarChart data={items} layout='vertical' margin={{ top: 4, right: 140, bottom: 4, left: 4 }}>
          <CartesianGrid horizontal={false} stroke='var(--color-bg-light)' strokeDasharray='3 5' />
          <XAxis domain={[0, 100]} hide type='number' />
          <YAxis
            axisLine={false}
            dataKey='tipo_carne_nombre'
            tick={{ fill: 'var(--color-neutral)', fontSize: 12, fontWeight: 500 }}
            tickLine={false}
            type='category'
            width={76}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-bg-light)', opacity: 0.35 }}
            formatter={(_value, _name, item) => {
              const row = item.payload as VolumeDispatchItem
              return [`${formatQuantity(row.cantidad)} ${unit} (${formatQuantity(row.porcentaje)}%)`, 'Volumen']
            }}
          />
          <Bar dataKey='porcentaje' fill='var(--color-secondary)' maxBarSize={18} radius={[0, 7, 7, 0]}>
            <LabelList content={(props) => <ValueLabel entry={props as ValueLabelProps} unit={unit} />} position='right' />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
