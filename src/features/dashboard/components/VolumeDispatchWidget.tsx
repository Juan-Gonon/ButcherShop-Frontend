import { FiActivity, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { useVolumeDispatch } from '../hooks/useVolumeDispatch'
import { VolumeDispatchChart } from './VolumeDispatchChart'
import { VolumeDispatchFilters } from './VolumeDispatchFilters'

const formatNumber = (value: number) => new Intl.NumberFormat('es-GT', { maximumFractionDigits: 2 }).format(value)

export const VolumeDispatchWidget = () => {
  const { period, setPeriod, unit, setUnit, data, status, error, retry } = useVolumeDispatch()

  return (
    <section aria-labelledby='volume-dispatch-title' className='min-w-0 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_12px_34px_-16px_rgba(92,77,60,0.22)] backdrop-blur-sm sm:p-5 lg:col-span-7'>
      <div className='flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between'>
        <div className='flex min-w-0 items-start gap-3'>
          <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl text-primary'>
            <FiActivity aria-hidden='true' />
          </span>
          <div className='min-w-0'>
            <h2 className='font-headline text-lg font-semibold tracking-tight text-neutral sm:text-xl' id='volume-dispatch-title'>Volumen y despacho de carne</h2>
            <p className='mt-1 text-sm text-neutral/85'>Distribución del volumen despachado por tipo de carne.</p>
          </div>
        </div>
        <VolumeDispatchFilters onPeriodChange={setPeriod} onUnitChange={setUnit} period={period} unit={unit} />
      </div>

      <div className='mt-5 rounded-2xl bg-bg-light/45 p-4 sm:flex sm:items-end sm:justify-between'>
        <div>
          <p className='font-label text-[10px] font-medium uppercase tracking-[0.14em] text-neutral'>Volumen total despachado</p>
          {status === 'loading' && !data
            ? <div aria-label='Cargando volumen total' className='mt-2 h-9 w-40 animate-pulse rounded-lg bg-bg-light' />
            : <p className='mt-1 font-label text-3xl font-semibold tabular-nums tracking-tight text-secondary sm:text-4xl'>
              {data ? formatNumber(data.volumen_total_general) : '—'} <span className='text-base font-medium'>{unit}</span>
            </p>}
        </div>
        <p className='mt-2 text-xs font-medium text-neutral sm:mt-0'>Período: <span className='capitalize'>{period}</span></p>
      </div>

      <div aria-live='polite' className='mt-4 min-w-0'>
        {status === 'loading' && (
          <div aria-label='Cargando desglose de volumen' className='space-y-4 py-2'>
            {[1, 2, 3].map((row) => <div className='flex animate-pulse items-center gap-3' key={row}><div className='h-4 w-16 rounded bg-bg-light' /><div className='h-3 flex-1 rounded-full bg-bg-light/70' /></div>)}
          </div>
        )}
        {status === 'error' && (
          <div className='flex flex-col gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between'>
            <p className='flex items-start gap-2 text-sm font-medium text-primary'><FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />{error}</p>
            <button className='inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary' onClick={retry} type='button'>
              <FiRefreshCw aria-hidden='true' /> Reintentar
            </button>
          </div>
        )}
        {status === 'empty' && <p className='rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-6 text-center text-sm text-neutral'>No hay volumen despachado para este período.</p>}
        {status === 'success' && data && <VolumeDispatchChart items={data.desglose} unit={unit} />}
      </div>
    </section>
  )
}
