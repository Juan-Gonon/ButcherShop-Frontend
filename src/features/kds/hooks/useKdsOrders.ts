import { isAxiosError, isCancel } from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getOrdersByState } from '../services/kdsService'
import type { KdsOrderState, KdsOrderWithState, KdsPagination } from '../types/kds'

interface QueryState {
  requestKey: string
  error: string | null
}

interface PendingRefetch {
  baseKey: string
  resolve: () => void
  reject: (error: Error) => void
}

const getBaseKey = (state: string, page: number, pageSize: number, refreshKey: number) =>
  `${state}:${page}:${pageSize}:${refreshKey}`

const getCancelledError = (message: string) => new Error(message)

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
  const pendingRefetch = useRef<PendingRefetch | null>(null)
  const baseKey = getBaseKey(state, page, pageSize, refreshKey)
  const requestKey = `${baseKey}:${requestVersion}`
  const rejectPendingRefetch = useCallback((error: Error) => {
    const pending = pendingRefetch.current
    if (!pending) return
    pendingRefetch.current = null
    pending.reject(error)
  }, [])

  const resolvePendingRefetch = useCallback((completedBaseKey: string) => {
    const pending = pendingRefetch.current
    if (!pending || pending.baseKey !== completedBaseKey) return
    pendingRefetch.current = null
    pending.resolve()
  }, [])

  useEffect(() => () => {
    rejectPendingRefetch(getCancelledError('La consulta se canceló porque el listado se desmontó.'))
  }, [rejectPendingRefetch])

  useEffect(() => {
    const pending = pendingRefetch.current
    if (pending && pending.baseKey !== baseKey) {
      rejectPendingRefetch(getCancelledError('La consulta se reemplazó por un cambio de filtros o página.'))
    }

    const controller = new AbortController()
    const requestId = activeRequest.current + 1
    activeRequest.current = requestId

    getOrdersByState({ estado: state, page, pageSize }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted || activeRequest.current !== requestId) return

        const { items, pagination: responsePagination } = response.data
        if (onPageCorrection && responsePagination.totalPages > 0 && page > responsePagination.totalPages) {
          const correctedBaseKey = getBaseKey(state, responsePagination.totalPages, pageSize, refreshKey)
          if (pendingRefetch.current?.baseKey === baseKey) {
            pendingRefetch.current.baseKey = correctedBaseKey
          }
          onPageCorrection(responsePagination.totalPages)
          return
        }

        if (onPageCorrection && responsePagination.totalPages === 0 && items.length === 0 && page > 1) {
          const correctedBaseKey = getBaseKey(state, 1, pageSize, refreshKey)
          if (pendingRefetch.current?.baseKey === baseKey) {
            pendingRefetch.current.baseKey = correctedBaseKey
          }
          onPageCorrection(1)
          return
        }

        setOrders(items as KdsOrderWithState<State>[])
        setPagination(responsePagination)
        setQueryState({ requestKey, error: null })
        setSuccessfulQueryCount((count) => count + 1)
        resolvePendingRefetch(baseKey)
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted || isCancel(requestError) || activeRequest.current !== requestId) return

        setQueryState({ requestKey, error: getRequestErrorMessage(requestError) })
        const pending = pendingRefetch.current
        if (pending?.baseKey === baseKey) {
          rejectPendingRefetch(requestError instanceof Error ? requestError : new Error(getRequestErrorMessage(requestError)))
        }
      })

    return () => {
      controller.abort()
      if (activeRequest.current === requestId) activeRequest.current += 1
    }
  }, [baseKey, onPageCorrection, page, pageSize, refreshKey, rejectPendingRefetch, requestKey, resolvePendingRefetch, state])

  const refetch = useCallback((): Promise<void> => {
    rejectPendingRefetch(getCancelledError('La consulta se reemplazó por una solicitud más reciente.'))
    const promise = new Promise<void>((resolve, reject) => {
      pendingRefetch.current = { baseKey, resolve, reject }
    })
    // Mark the rejection as observed for existing fire-and-forget UI handlers;
    // callers that await this promise still receive the rejection.
    void promise.catch(() => undefined)
    setRequestVersion((version) => version + 1)
    return promise
  }, [baseKey, rejectPendingRefetch])

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
