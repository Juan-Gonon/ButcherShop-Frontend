import { isAxiosError } from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { transitionOrderState } from '../services/kdsService'
import type { KdsPreparingOrder } from '../types/kds'
import { KdsOrdersRefetchCancelledError } from './useKdsOrders'

export interface ReturnToCounterState {
  loading: boolean
  transitionSucceeded: boolean
  transitionError: string | null
  refreshError: string | null
}

export type ReturnToCounterResult =
  | { status: 'already-in-progress' }
  | { status: 'transition-failed'; error: string; refreshError?: string }
  | { status: 'returned' }
  | { status: 'returned-refresh-failed'; error: string }
  | { status: 'returned-unmounted' }

const getTransitionErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ error?: unknown }>(error)) {
    if (error.response?.status === 409) {
      return 'El pedido pudo haber cambiado de estado. Verifica su información actualizada antes de volver a intentarlo.'
    }

    const backendMessage = error.response?.data?.error
    if (typeof backendMessage === 'string' && backendMessage.trim()) return backendMessage

    if (!error.response) {
      return 'No se pudo conectar con el servidor. Comprueba la conexión e inténtalo de nuevo.'
    }
  }

  if (error instanceof Error && error.message) return error.message
  return 'No se pudo devolver el pedido a mostrador. Inténtalo de nuevo.'
}

const getRefreshErrorMessage = (error: unknown): string => {
  if (error instanceof KdsOrdersRefetchCancelledError) {
    return 'El pedido volvió a Confirmado, pero la consulta se canceló al cambiar de página. Verifica ambas listas.'
  }

  const reason = error instanceof Error && error.message ? ` ${error.message}` : ''
  return `El pedido volvió a Confirmado, pero no se pudieron actualizar ambas listas. Vuelve a consultar.${reason}`
}

const isConflictError = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 409

export const useReturnToCounter = () => {
  const [stateByOrder, setStateByOrder] = useState<ReadonlyMap<string, ReturnToCounterState>>(() => new Map())
  const inFlightOrders = useRef(new Set<string>())
  const latestRequestByOrder = useRef(new Map<string, number>())
  const nextRequestId = useRef(0)
  const isMounted = useRef(false)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const returnToCounter = useCallback(async (
    order: KdsPreparingOrder,
    refreshOrders: () => Promise<void>,
    onTransitionSucceeded: () => void
  ): Promise<ReturnToCounterResult> => {
    if (inFlightOrders.current.has(order.uuid)) return { status: 'already-in-progress' }

    inFlightOrders.current.add(order.uuid)
    const requestId = nextRequestId.current + 1
    nextRequestId.current = requestId
    latestRequestByOrder.current.set(order.uuid, requestId)

    const isCurrentRequest = () =>
      isMounted.current && latestRequestByOrder.current.get(order.uuid) === requestId

    const updateCurrentState = (nextState: ReturnToCounterState) => {
      if (!isCurrentRequest()) return
      setStateByOrder((current) => new Map(current).set(order.uuid, nextState))
    }

    updateCurrentState({
      loading: true,
      transitionSucceeded: false,
      transitionError: null,
      refreshError: null
    })

    try {
      await transitionOrderState(order.uuid, {
        estado_actual_esperado: 'En preparación',
        estado_destino: 'Confirmado'
      })

      if (!isCurrentRequest()) return { status: 'returned-unmounted' }

      updateCurrentState({
        loading: true,
        transitionSucceeded: true,
        transitionError: null,
        refreshError: null
      })
      onTransitionSucceeded()

      try {
        await refreshOrders()
      } catch (refreshError: unknown) {
        const message = getRefreshErrorMessage(refreshError)
        updateCurrentState({
          loading: false,
          transitionSucceeded: true,
          transitionError: null,
          refreshError: message
        })
        return { status: 'returned-refresh-failed', error: message }
      }

      updateCurrentState({
        loading: false,
        transitionSucceeded: true,
        transitionError: null,
        refreshError: null
      })
      return { status: 'returned' }
    } catch (transitionError: unknown) {
      const message = getTransitionErrorMessage(transitionError)
      let refreshError: string | undefined

      if (isConflictError(transitionError) && isCurrentRequest()) {
        try {
          await refreshOrders()
        } catch (requestError: unknown) {
          refreshError = getRefreshErrorMessage(requestError)
        }
      }

      updateCurrentState({
        loading: false,
        transitionSucceeded: false,
        transitionError: message,
        refreshError: refreshError ?? null
      })
      return refreshError
        ? { status: 'transition-failed', error: message, refreshError }
        : { status: 'transition-failed', error: message }
    } finally {
      inFlightOrders.current.delete(order.uuid)
    }
  }, [])

  const clearOrderState = useCallback((orderUuid: string) => {
    setStateByOrder((current) => {
      if (!current.has(orderUuid)) return current
      const next = new Map(current)
      next.delete(orderUuid)
      return next
    })
  }, [])

  return { returnToCounter, stateByOrder, clearOrderState }
}
