import { isAxiosError } from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { KdsOrdersRefetchCancelledError } from './useKdsOrders'
import { transitionOrderState } from '../services/kdsService'
import type { KdsDeliveryType, KdsPreparingOrder } from '../types/kds'

export interface FinishPreparationState {
  loading: boolean
  transitionSucceeded: boolean
  transitionError: string | null
  refreshError: string | null
}

export type FinishPreparationResult =
  | { status: 'already-in-progress' }
  | { status: 'transition-failed'; error: string; refreshError?: string }
  | { status: 'completed' }
  | { status: 'completed-refresh-failed'; error: string }
  | { status: 'completed-unmounted' }

type FinalOrderState = 'Entregado' | 'En camino'

const getDestination = (deliveryType: KdsDeliveryType): FinalOrderState => {
  switch (deliveryType) {
  case 'Recoger en tienda':
    return 'Entregado'
  case 'A domicilio':
    return 'En camino'
  default: {
    const unsupportedDeliveryType: never = deliveryType
    throw new Error(`Tipo de entrega no soportado: ${unsupportedDeliveryType}`)
  }
  }
}

const getTransitionErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ error?: unknown }>(error)) {
    if (error.response?.status === 409) {
      return 'El pedido cambió de estado o la transición ya no está disponible.'
    }

    const backendMessage = error.response?.data?.error
    if (typeof backendMessage === 'string' && backendMessage.trim()) return backendMessage

    if (!error.response) {
      return 'No se pudo conectar con el servidor. Comprueba la conexión e inténtalo de nuevo.'
    }
  }

  if (error instanceof Error && error.message) return error.message
  return 'No se pudo finalizar la preparación. Inténtalo de nuevo.'
}

const getRefreshErrorMessage = (error: unknown, afterConflict = false): string => {
  if (error instanceof KdsOrdersRefetchCancelledError) {
    return afterConflict
      ? 'El conflicto se detectó, pero la consulta anterior se canceló al cambiar de página. Verifica el listado actual.'
      : 'El pedido se finalizó correctamente, pero la consulta anterior se canceló al cambiar de página. Verifica el listado actual.'
  }

  const reason = error instanceof Error && error.message ? ` ${error.message}` : ''
  const context = afterConflict
    ? 'No se pudo actualizar la lista después del conflicto. Vuelve a consultar los pedidos.'
    : 'El pedido se finalizó correctamente, pero no se pudo actualizar la lista. Vuelve a consultar los pedidos.'
  return `${context}${reason}`
}

const isConflictError = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 409

export const useFinishPreparation = () => {
  const [stateByOrder, setStateByOrder] = useState<ReadonlyMap<string, FinishPreparationState>>(() => new Map())
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

  const finishPreparation = useCallback(async (
    order: KdsPreparingOrder,
    refreshOrders: () => Promise<void>
  ): Promise<FinishPreparationResult> => {
    if (inFlightOrders.current.has(order.uuid)) {
      return { status: 'already-in-progress' }
    }

    inFlightOrders.current.add(order.uuid)
    const requestId = nextRequestId.current + 1
    nextRequestId.current = requestId
    latestRequestByOrder.current.set(order.uuid, requestId)

    const isCurrentRequest = () =>
      isMounted.current && latestRequestByOrder.current.get(order.uuid) === requestId

    const updateCurrentState = (nextState: FinishPreparationState) => {
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
        estado_destino: getDestination(order.tipo_entrega)
      })

      if (!isCurrentRequest()) return { status: 'completed-unmounted' }

      updateCurrentState({
        loading: true,
        transitionSucceeded: true,
        transitionError: null,
        refreshError: null
      })

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
        return { status: 'completed-refresh-failed', error: message }
      }

      updateCurrentState({
        loading: false,
        transitionSucceeded: true,
        transitionError: null,
        refreshError: null
      })
      return { status: 'completed' }
    } catch (transitionError: unknown) {
      const message = getTransitionErrorMessage(transitionError)
      let refreshError: string | undefined

      if (isConflictError(transitionError) && isCurrentRequest()) {
        try {
          await refreshOrders()
        } catch (requestError: unknown) {
          refreshError = getRefreshErrorMessage(requestError, true)
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

  return { finishPreparation, stateByOrder, clearOrderState }
}
