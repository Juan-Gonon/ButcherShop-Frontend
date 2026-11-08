import { DashboardHeader } from '../features/dashboard/components/DashboardHeader'
import { DashboardMetrics } from '../features/dashboard/components/DashboardMetrics'
import { useDashboardMetrics } from '../features/dashboard/hooks/useDashboardMetrics'
import { useAuthStore } from '../store/hooks/useAuthStore'

export const CarniceriaDashboardPage = () => {
  const { user } = useAuthStore()
  const { period, setPeriod, data, status, error, retry } = useDashboardMetrics()

  return (
    <main className='min-h-full bg-stone-50/70 p-4 sm:p-6 lg:p-8'>
      <div className='mx-auto flex w-full max-w-7xl flex-col gap-8'>
        <DashboardHeader
          onPeriodChange={setPeriod}
          period={period}
          userName={user?.nombre}
        />
        <section aria-label='Indicadores principales' className='space-y-4'>
          <div>
            <h2 className='text-lg font-bold text-stone-900'>Indicadores principales</h2>
            <p className='mt-1 text-sm text-stone-500'>Resumen de pedidos entregados del período seleccionado.</p>
          </div>
          <DashboardMetrics data={data} error={error} onRetry={retry} status={status} />
        </section>
      </div>
    </main>
  )
}
