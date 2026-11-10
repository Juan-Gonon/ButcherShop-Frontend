import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { getShippingSectors } from '../services/shippingSectorService'
import type { ShippingSector } from '../types/shippingSector'

type ShippingSectorsStatus = 'loading' | 'error' | 'empty' | 'success' | 'forbidden'

interface ShippingSectorsResult {
  enabled: boolean
  request: number
  data: ShippingSector[]
  status: Exclude<ShippingSectorsStatus, 'loading' | 'forbidden'>
  error: string | null
}

const getRequestErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Tu sesión no está autorizada para consultar los sectores de envío.'
    }

    if (error.response?.status === 403) {
      return 'Tu rol no tiene permiso para consultar los sectores de envío.'
    }
  }

  return 'No se pudieron cargar los sectores de envío. Intenta de nuevo.'
}

export const useShippingAddresses = (enabled = true) => {
  const [retryCount, setRetryCount] = useState(0)
  const [queryResult, setQueryResult] = useState<ShippingSectorsResult | null>(null)

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()

    getShippingSectors(controller.signal)
      .then((sectors) => {
        if (controller.signal.aborted) return

        setQueryResult({
          enabled,
          request: retryCount,
          data: sectors,
          status: sectors.length === 0 ? 'empty' : 'success',
          error: null
        })
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return

        setQueryResult({
          enabled,
          request: retryCount,
          data: [],
          status: 'error',
          error: getRequestErrorMessage(requestError)
        })
      })

    return () => controller.abort()
  }, [enabled, retryCount])

  const currentResult =
    queryResult?.enabled === enabled && queryResult.request === retryCount
      ? queryResult
      : null
  const status: ShippingSectorsStatus = !enabled
    ? 'forbidden'
    : currentResult?.status ?? 'loading'

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  return {
    data: currentResult?.data ?? null,
    isLoading: status === 'loading',
    error:
      status === 'forbidden'
        ? 'Tu rol no tiene permiso para consultar los sectores de envío.'
        : currentResult?.error ?? null,
    status,
    retry
  }
}
