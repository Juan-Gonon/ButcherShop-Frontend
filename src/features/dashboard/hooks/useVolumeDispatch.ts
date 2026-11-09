import { useCallback, useEffect, useState } from 'react'
import { getVolumeDispatch } from '../services/volumeDispatchService'
import type {
  VolumeDispatchData,
  VolumeDispatchPeriod,
  VolumeDispatchUnit
} from '../types/volumeDispatch'

type VolumeDispatchStatus = 'loading' | 'error' | 'empty' | 'success'

export const useVolumeDispatch = () => {
  const [period, setPeriod] = useState<VolumeDispatchPeriod>('hoy')
  const [unit, setUnit] = useState<VolumeDispatchUnit>('lb')
  const [retryCount, setRetryCount] = useState(0)
  const [queryResult, setQueryResult] = useState<{
    key: string
    data: VolumeDispatchData | null
    status: Exclude<VolumeDispatchStatus, 'loading'>
    error: string | null
  } | null>(null)
  const queryKey = `${period}:${unit}:${retryCount}`

  useEffect(() => {
    const controller = new AbortController()

    getVolumeDispatch({ periodo: period, unidad: unit }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        setQueryResult({
          key: queryKey,
          data: result,
          status: result.desglose.length === 0 && result.volumen_total_general === 0 ? 'empty' : 'success',
          error: null
        })
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setQueryResult({
          key: queryKey,
          data: null,
          status: 'error',
          error: 'No se pudo cargar el volumen y despacho. Intenta de nuevo.'
        })
      })

    return () => controller.abort()
  }, [period, unit, retryCount, queryKey])

  const currentResult = queryResult?.key === queryKey ? queryResult : null
  const data = currentResult?.data ?? null
  const status: VolumeDispatchStatus = currentResult?.status ?? 'loading'
  const error = currentResult?.error ?? null

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  const selectPeriod = useCallback((nextPeriod: VolumeDispatchPeriod) => {
    setPeriod(nextPeriod)
  }, [])

  const selectUnit = useCallback((nextUnit: VolumeDispatchUnit) => {
    setUnit(nextUnit)
  }, [])

  return { period, setPeriod: selectPeriod, unit, setUnit: selectUnit, data, status, error, retry }
}
