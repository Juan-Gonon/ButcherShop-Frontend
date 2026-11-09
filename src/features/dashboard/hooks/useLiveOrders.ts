import { useCallback, useEffect, useState } from 'react'
import { getLiveOrders } from '../services/liveOrdersService'
import type { LiveOrder } from '../types/liveOrders'

type LiveOrdersStatus = 'loading' | 'error' | 'empty' | 'success'

export const useLiveOrders = () => {
  const [retryCount, setRetryCount] = useState(0)
  const [queryResult, setQueryResult] = useState<{
    request: number
    data: LiveOrder[] | null
    status: Exclude<LiveOrdersStatus, 'loading'>
    error: string | null
  } | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getLiveOrders(controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return
        if (!response.ok) {
          setQueryResult({
            request: retryCount,
            data: null,
            status: 'error',
            error: 'No se pudieron cargar los pedidos en curso. Intenta de nuevo.'
          })
          return
        }

        setQueryResult({
          request: retryCount,
          data: response.data,
          status: response.data.length === 0 ? 'empty' : 'success',
          error: null
        })
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setQueryResult({
          request: retryCount,
          data: null,
          status: 'error',
          error: 'No se pudieron cargar los pedidos en curso. Intenta de nuevo.'
        })
      })

    return () => controller.abort()
  }, [retryCount])

  const currentResult = queryResult?.request === retryCount ? queryResult : null
  const data = currentResult?.data ?? null
  const status: LiveOrdersStatus = currentResult?.status ?? 'loading'
  const error = currentResult?.error ?? null

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  return { data, loading: status === 'loading', status, error, retry }
}
