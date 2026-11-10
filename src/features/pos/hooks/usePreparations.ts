import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { getPreparations } from '../services/preparationService'
import type { Preparation, PreparationsStatus } from '../types/preparation'

interface PreparationsResult {
  session: number
  request: number
  data: Preparation[]
  status: Exclude<PreparationsStatus, 'idle' | 'loading'>
  error: string | null
}

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error) && error.response?.status === 401) {
    return 'Tu sesión no está autorizada para consultar las preparaciones.'
  }

  if (isAxiosError(error) && error.response?.status === 403) {
    return 'Tu rol no tiene permiso para consultar las preparaciones.'
  }

  return 'No se pudieron cargar las preparaciones. Intenta de nuevo.'
}

export const usePreparations = (enabled: boolean, session: number) => {
  const [retryCount, setRetryCount] = useState(0)
  const [queryResult, setQueryResult] = useState<PreparationsResult | null>(null)

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()

    getPreparations(controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return

        setQueryResult({
          session,
          request: retryCount,
          data: response.preparations,
          status: response.preparations.length === 0 ? 'empty' : 'success',
          error: null
        })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        setQueryResult({
          session,
          request: retryCount,
          data: [],
          status: 'error',
          error: getErrorMessage(error)
        })
      })

    return () => controller.abort()
  }, [enabled, retryCount, session])

  const currentResult =
    queryResult?.session === session && queryResult.request === retryCount
      ? queryResult
      : null
  const status: PreparationsStatus = !enabled
    ? 'idle'
    : currentResult?.status ?? 'loading'

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  return {
    data: currentResult?.data ?? [],
    isLoading: status === 'loading',
    error: currentResult?.error ?? null,
    status,
    retry
  }
}
