import { useCallback, useEffect, useState } from 'react'
import { getDashboardSummary } from '../services/dashboardService'
import type {
  DashboardPeriod,
  DashboardSummaryData,
  DashboardSummaryParams
} from '../types/dashboard'

type DashboardQueryStatus = 'pending-date' | 'loading' | 'error' | 'empty' | 'success'

const resolveDashboardDateRange = (
  period: DashboardPeriod
): DashboardSummaryParams | null => {
  // Pendiente: acordar la zona comercial con la zona local del proceso backend.
  // No se envía la consulta hasta poder resolver fechas YYYY-MM-DD válidas.
  const unresolvedDateRanges: Record<DashboardPeriod, DashboardSummaryParams | null> = {
    hoy: null,
    ayer: null
  }
  return unresolvedDateRanges[period]
}

const isSummaryEmpty = (summary: DashboardSummaryData) =>
  Number(summary.pedidos_entregados) === 0 && summary.volumen_vendido.length === 0

export const useDashboardMetrics = () => {
  const [period, setPeriod] = useState<DashboardPeriod>('hoy')
  const [retryCount, setRetryCount] = useState(0)
  const [data, setData] = useState<DashboardSummaryData | null>(null)
  const [status, setStatus] = useState<DashboardQueryStatus>('pending-date')
  const [error, setError] = useState<string | null>(null)

  const selectPeriod = useCallback((nextPeriod: DashboardPeriod) => {
    setPeriod(nextPeriod)
    setData(null)
    setError(null)
    setStatus('pending-date')
  }, [])

  useEffect(() => {
    const params = resolveDashboardDateRange(period)

    if (!params) return

    let active = true
    Promise.resolve()
      .then(() => {
        if (!active) return null
        setStatus('loading')
        setError(null)
        return getDashboardSummary(params)
      })
      .then((summary) => {
        if (!active || !summary) return
        setData(summary)
        setStatus(isSummaryEmpty(summary) ? 'empty' : 'success')
      })
      .catch(() => {
        if (!active) return
        setError('No se pudieron cargar los indicadores. Intenta de nuevo.')
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [period, retryCount])

  const retry = useCallback(() => setRetryCount((count) => count + 1), [])

  return { period, setPeriod: selectPeriod, data, status, error, retry }
}
