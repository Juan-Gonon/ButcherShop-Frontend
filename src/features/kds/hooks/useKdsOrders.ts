import { isAxiosError, isCancel } from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getOrdersByState } from '../services/kdsService'
import type { KdsOrderState, KdsOrderWithState, KdsPagination } from '../types/kds'

interface QueryState {
  requestKey: string
  error: string | null
}

interface RefetchWaiter {
  resolve: () => void
  reject: (error: Error) => void
}

interface RefetchCycle {
  targetBaseKey: string
  waiters: RefetchWaiter[]
}

interface ActiveQuery {
  baseKey: string
  requestId: number
  manual: boolean
}

const getBaseKey = (state: string, page: number, pageSize: number, refreshKey: number) =>
  `${state}:${page}:${pageSize}:${refreshKey}`

export class KdsOrdersRefetchCancelledError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KdsOrdersRefetchCancelledError'
  }
}

const getCancelledError = (message: string) => new KdsOrdersRefetchCancelledError(message)

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
  const refetchCycle = useRef<RefetchCycle | null>(null)
  const activeQuery = useRef<ActiveQuery | null>(null)
  const baseKey = getBaseKey(state, page, pageSize, refreshKey)
  const requestKey = `${baseKey}:${requestVersion}`
  const rejectPendingRefetch = useCallback((error: Error) => {
    const cycle = refetchCycle.current
    if (!cycle) return
    refetchCycle.current = null
    cycle.waiters.forEach((waiter) => waiter.reject(error))
  }, [])

  const resolvePendingRefetch = useCallback((completedBaseKey: string) => {
    const cycle = refetchCycle.current
    if (!cycle || cycle.targetBaseKey !== completedBaseKey) return
    refetchCycle.current = null
    cycle.waiters.forEach((waiter) => waiter.resolve())
  }, [])

  useEffect(() => () => {
    rejectPendingRefetch(getCancelledError('La consulta se canceló porque el listado se desmontó.'))
  }, [rejectPendingRefetch])

  useEffect(() => {
    const cycle = refetchCycle.current
    if (cycle && cycle.targetBaseKey !== baseKey) {
      rejectPendingRefetch(getCancelledError('La consulta se reemplazó por un cambio de filtros o página.'))
    }

    const controller = new AbortController()
    const requestId = activeRequest.current + 1
    activeRequest.current = requestId
    activeQuery.current = {
      baseKey,
      requestId,
      manual: refetchCycle.current?.targetBaseKey === baseKey
    }

    getOrdersByState({ estado: state, page, pageSize }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted || activeRequest.current !== requestId) return
        if (activeQuery.current?.requestId === requestId) activeQuery.current = null

        const { items, pagination: responsePagination } = response.data
        if (onPageCorrection && responsePagination.totalPages > 0 && page > responsePagination.totalPages) {
          const correctedBaseKey = getBaseKey(state, responsePagination.totalPages, pageSize, refreshKey)
          if (refetchCycle.current?.targetBaseKey === baseKey) {
            refetchCycle.current.targetBaseKey = correctedBaseKey
          }
          onPageCorrection(responsePagination.totalPages)
          return
        }

        if (onPageCorrection && responsePagination.totalPages === 0 && items.length === 0 && page > 1) {
          const correctedBaseKey = getBaseKey(state, 1, pageSize, refreshKey)
          if (refetchCycle.current?.targetBaseKey === baseKey) {
            refetchCycle.current.targetBaseKey = correctedBaseKey
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
        if (activeQuery.current?.requestId === requestId) activeQuery.current = null

        setQueryState({ requestKey, error: getRequestErrorMessage(requestError) })
        if (refetchCycle.current?.targetBaseKey === baseKey) {
          rejectPendingRefetch(requestError instanceof Error ? requestError : new Error(getRequestErrorMessage(requestError)))
        }
      })

    return () => {
      controller.abort()
      if (activeQuery.current?.requestId === requestId) activeQuery.current = null
      if (activeRequest.current === requestId) activeRequest.current += 1
    }
  }, [baseKey, onPageCorrection, page, pageSize, refreshKey, rejectPendingRefetch, requestKey, resolvePendingRefetch, state])

  const refetch = useCallback((): Promise<void> => {
    const promise = new Promise<void>((resolve, reject) => {
      const waiter = { resolve, reject }
      const currentCycle = refetchCycle.current

      if (currentCycle?.targetBaseKey === baseKey) {
        currentCycle.waiters.push(waiter)
        return
      }

      if (currentCycle) {
        rejectPendingRefetch(getCancelledError('La consulta se reemplazó por un cambio de filtros o página.'))
      }

      const nextCycle: RefetchCycle = { targetBaseKey: baseKey, waiters: [waiter] }
      refetchCycle.current = nextCycle

      // Join an in-flight manual request. An automatic request is invalidated
      // so a refresh requested after a mutation gets a fresh server response.
      if (activeQuery.current?.baseKey === baseKey && activeQuery.current.manual) return

      setRequestVersion((version) => version + 1)
    })
    // Mark the rejection as observed for existing fire-and-forget UI handlers;
    // callers that await this promise still receive the rejection.
    void promise.catch(() => undefined)
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
