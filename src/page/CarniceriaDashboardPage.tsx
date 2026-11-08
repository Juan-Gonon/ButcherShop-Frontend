import { DashboardHeader } from '../features/dashboard/components/DashboardHeader'
import { DashboardMetrics } from '../features/dashboard/components/DashboardMetrics'
import { useDashboardMetrics } from '../features/dashboard/hooks/useDashboardMetrics'
import { useAuthStore } from '../store/hooks/useAuthStore'

export const CarniceriaDashboardPage = () => {
  const { user } = useAuthStore()
  const { period, setPeriod, data, status, error, retry } = useDashboardMetrics()

  return (
    <main className='min-h-full bg-bg-light/40 p-3 sm:p-5 lg:p-7'>
      <div className='mx-auto w-full max-w-screen-2xl'>
        <div className='rounded-3xl border border-white/80 bg-white/75 p-4 shadow-[0_8px_30px_-10px_rgba(92,77,60,0.12)] backdrop-blur-sm sm:p-6 lg:p-8'>
          <DashboardHeader
            onPeriodChange={setPeriod}
            period={period}
            userName={user?.nombre}
          />
          <section aria-label='Indicadores principales' className='mt-7 border-t border-bg-light/80 pt-6 sm:mt-8 sm:pt-7'>
            <div className='mb-5 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between'>
              <div>
                <p className='font-label text-[11px] font-medium uppercase tracking-[0.12em] text-secondary'>Resumen operativo</p>
                <h2 className='mt-1 text-xl font-semibold tracking-tight text-neutral sm:text-2xl'>Indicadores principales</h2>
              </div>
              <p className='text-sm text-neutral'>Ventas y pedidos entregados de {period}.</p>
            </div>
            <DashboardMetrics data={data} error={error} onRetry={retry} status={status} />
          </section>
        </div>
      </div>
    </main>
  )
}
