import { useCallback, useEffect, useState } from 'react'
import { getConsumerFinal } from '../services/consumerFinalService'
import type { ConsumerFinal } from '../types/consumerFinal'

type ConsumerFinalStatus = 'loading' | 'error' | 'success'

export const useConsumerFinal = () => {
  const [retryCount, setRetryCount] = useState(0)
  const [queryResult, setQueryResult] = useState<{
    request: number
    data: ConsumerFinal | null
    status: Exclude<ConsumerFinalStatus, 'loading'>
    error: string | null
  } | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getConsumerFinal(controller.signal)
      .then((consumerFinal) => {
        if (controller.signal.aborted) return

        setQueryResult({
          request: retryCount,
          data: consumerFinal,
          status: 'success',
          error: null
        })
      })
      .catch(() => {
        if (controller.signal.aborted) return

        setQueryResult({
          request: retryCount,
          data: null,
          status: 'error',
          error: 'No se pudo cargar el Consumidor Final. Intenta de nuevo.'
        })
      })

    return () => controller.abort()
  }, [retryCount])

  const currentResult = queryResult?.request === retryCount ? queryResult : null
  const status: ConsumerFinalStatus = currentResult?.status ?? 'loading'

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  const data = currentResult?.data ?? null

  return {
    data,
    selectedClientUuid: data?.uuid ?? null,
    status,
    loading: status === 'loading',
    error: currentResult?.error ?? null,
    retry
  }
}
