import { isAxiosError, isCancel } from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getOrdersByState } from '../services/kdsService'
import type { KdsOrderState, KdsOrderWithState, KdsPagination } from '../types/kds'

interface QueryState {
  requestKey: string
  error: string | null
}

const getRequestErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ error?: unknown }>(error)) {
    if (error.response?.status === 401) return 'Tu sesión no está autorizada para consultar los pedidos.'
    if (error.response?.status === 403) return 'Tu rol no tiene permiso para consultar los pedidos.'

    const backendMessage = error.response?.data?.error
    if (typeof backendMessage === 'string' && backendMessage.trim()) return backendMessage
  }

  if (error instanceof Error && error.message) return error.message
  return 'No se pudieron cargar los pedidos. Intenta de nuevo.'
}

export const useKdsOrders = <State extends KdsOrderState>(
  state: State,
  pageSize = 20,
  page = 1,
  refreshKey = 0,
  onPageCorrection?: (validPage: number) => void
) => {
  const [requestVersion, setRequestVersion] = useState(0)
  const [orders, setOrders] = useState<KdsOrderWithState<State>[]>([])
  const [pagination, setPagination] = useState<KdsPagination | null>(null)
  const [queryState, setQueryState] = useState<QueryState | null>(null)
  const [successfulQueryCount, setSuccessfulQueryCount] = useState(0)
  const activeRequest = useRef(0)
  const requestKey = `${state}:${page}:${pageSize}:${refreshKey}:${requestVersion}`

  useEffect(() => {
    const controller = new AbortController()
    const requestId = activeRequest.current + 1
    activeRequest.current = requestId

    getOrdersByState({ estado: state, page, pageSize }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted || activeRequest.current !== requestId) return

        const { items, pagination: responsePagination } = response.data
        if (onPageCorrection && responsePagination.totalPages > 0 && page > responsePagination.totalPages) {
          onPageCorrection(responsePagination.totalPages)
          return
        }

        if (onPageCorrection && responsePagination.totalPages === 0 && items.length === 0 && page > 1) {
          onPageCorrection(1)
          return
        }

        setOrders(items as KdsOrderWithState<State>[])
        setPagination(responsePagination)
        setQueryState({ requestKey, error: null })
        setSuccessfulQueryCount((count) => count + 1)
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted || isCancel(requestError) || activeRequest.current !== requestId) return

        setQueryState({ requestKey, error: getRequestErrorMessage(requestError) })
      })

    return () => {
      controller.abort()
      if (activeRequest.current === requestId) activeRequest.current += 1
    }
  }, [onPageCorrection, page, pageSize, requestKey, state])

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
