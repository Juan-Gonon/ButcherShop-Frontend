import { DashboardHeader } from '../features/dashboard/components/DashboardHeader'
import { DashboardMetrics } from '../features/dashboard/components/DashboardMetrics'
import { useDashboardMetrics } from '../features/dashboard/hooks/useDashboardMetrics'
import { VolumeDispatchWidget } from '../features/dashboard/components/VolumeDispatchWidget'
import { useAuthStore } from '../store/hooks/useAuthStore'

export const CarniceriaDashboardPage = () => {
  const { user } = useAuthStore()
  const { period, setPeriod, data, status, error, retry } = useDashboardMetrics()

  return (
    <main className='min-h-full bg-bg-light/40 p-2.5 sm:p-3.5 lg:p-4'>
      <div className='mx-auto w-full max-w-screen-2xl'>
        <div className='rounded-2xl border border-white/80 bg-white/75 p-3.5 shadow-[0_8px_30px_-10px_rgba(92,77,60,0.12)] backdrop-blur-sm sm:p-4'>
          <DashboardHeader
            onPeriodChange={setPeriod}
            period={period}
            userName={user?.nombre}
          />
          <section aria-label='Indicadores principales' className='mt-5 border-t border-bg-light/80 pt-4 sm:mt-6 sm:pt-5'>
            <div className='mb-4 flex flex-col gap-1 sm:mb-4 sm:flex-row sm:items-end sm:justify-between'>
              <div>
                <p className='font-label text-[11px] font-medium uppercase tracking-[0.12em] text-secondary'>Resumen operativo</p>
                <h2 className='mt-0.5 text-lg font-semibold tracking-tight text-neutral sm:text-xl'>Indicadores principales</h2>
              </div>
              <p className='text-sm text-neutral'>Ventas y pedidos entregados de {period}.</p>
            </div>
            <DashboardMetrics data={data} error={error} onRetry={retry} status={status} />
          </section>
        </div>
        <section aria-label='Volumen y despacho' className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12'>
          <VolumeDispatchWidget />
        </section>
      </div>
    </main>
  )
}
