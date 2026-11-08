import { useCallback, useEffect, useState } from 'react'
import { getDashboardSummary } from '../services/dashboardService'
import type {
  DashboardPeriod,
  DashboardSummaryData
} from '../types/dashboard'
import { getDashboardDateRange } from '../utils/dashboardDate'

type DashboardQueryStatus = 'loading' | 'error' | 'empty' | 'success'

const isSummaryEmpty = (summary: DashboardSummaryData) =>
  Number(summary.pedidos_entregados) === 0

export const useDashboardMetrics = () => {
  const [period, setPeriod] = useState<DashboardPeriod>('hoy')
  const [retryCount, setRetryCount] = useState(0)
  const [data, setData] = useState<DashboardSummaryData | null>(null)
  const [status, setStatus] = useState<DashboardQueryStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const selectPeriod = useCallback((nextPeriod: DashboardPeriod) => {
    if (nextPeriod === period) return
    setPeriod(nextPeriod)
    setData(null)
    setError(null)
    setStatus('loading')
  }, [period])

  useEffect(() => {
    const controller = new AbortController()
    const params = getDashboardDateRange(period)

    getDashboardSummary(params, controller.signal)
      .then((summary) => {
        if (controller.signal.aborted) return
        setData(summary)
        setStatus(isSummaryEmpty(summary) ? 'empty' : 'success')
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setError('No se pudieron cargar los indicadores. Intenta de nuevo.')
        setStatus('error')
      })

    return () => {
      controller.abort()
    }
  }, [period, retryCount])

  const retry = useCallback(() => {
    setData(null)
    setError(null)
    setStatus('loading')
    setRetryCount((count) => count + 1)
  }, [])

  return { period, setPeriod: selectPeriod, data, status, error, retry }
}
