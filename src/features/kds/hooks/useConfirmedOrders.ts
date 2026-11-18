import { isAxiosError, isCancel } from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getConfirmedOrders } from '../services/kdsService'
import type { KdsConfirmedOrder, KdsPagination } from '../types/kds'

interface QueryState {
  requestKey: string
  error: string | null
}

const getRequestErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ error?: unknown }>(error)) {
    if (error.response?.status === 401) {
      return 'Tu sesión no está autorizada para consultar los pedidos.'
    }

    if (error.response?.status === 403) {
      return 'Tu rol no tiene permiso para consultar los pedidos.'
    }

    const backendMessage = error.response?.data?.error
    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'No se pudieron cargar los pedidos confirmados. Intenta de nuevo.'
}

export const useConfirmedOrders = (pageSize = 20, page = 1) => {
  const [requestVersion, setRequestVersion] = useState(0)
  const [orders, setOrders] = useState<KdsConfirmedOrder[]>([])
  const [pagination, setPagination] = useState<KdsPagination | null>(null)
  const [queryState, setQueryState] = useState<QueryState | null>(null)
  const [successfulQueryCount, setSuccessfulQueryCount] = useState(0)
  const activeRequest = useRef(0)
  const requestKey = `${page}:${pageSize}:${requestVersion}`

  useEffect(() => {
    const controller = new AbortController()
    const requestId = activeRequest.current + 1
    activeRequest.current = requestId

    getConfirmedOrders(
      { estado: 'Confirmado', page, pageSize },
      controller.signal
    )
      .then((response) => {
        if (controller.signal.aborted || activeRequest.current !== requestId) {
          return
        }

        setOrders(response.data.items)
        setPagination(response.data.pagination)
        setQueryState({ requestKey, error: null })
        setSuccessfulQueryCount((count) => count + 1)
      })
      .catch((requestError: unknown) => {
        if (
          controller.signal.aborted ||
          isCancel(requestError) ||
          activeRequest.current !== requestId
        ) {
          return
        }

        setQueryState({
          requestKey,
          error: getRequestErrorMessage(requestError)
        })
      })

    return () => {
      controller.abort()
      if (activeRequest.current === requestId) {
        activeRequest.current += 1
      }
    }
  }, [page, pageSize, requestKey])

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1)
  }, [])

  const currentQueryState = queryState?.requestKey === requestKey ? queryState : null

  return {
    orders,
    pagination,
    successfulQueryCount,
    loading: currentQueryState === null,
    error: currentQueryState?.error ?? null,
    refetch
  }
}

