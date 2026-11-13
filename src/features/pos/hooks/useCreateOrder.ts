import { useCallback, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { createOrder } from '../services/orderService'
import type {
  CreateOrderRequest,
  CreateOrderSuccessResponse
} from '../types/createOrder'

export type CreateOrderStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'error'
  | 'uncertain'

export type CreateOrderState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; response: CreateOrderSuccessResponse }
  | { status: 'error'; message: string; httpStatus?: number }
  | { status: 'uncertain'; message: string; httpStatus?: number }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isSuccessResponse = (value: unknown): value is CreateOrderSuccessResponse => {
  if (!isRecord(value) || value.ok !== true || !isRecord(value.data)) {
    return false
  }

  return (
    isNonEmptyString(value.data.message) &&
    isNonEmptyString(value.data.id_pedido) &&
    isNonEmptyString(value.data.uuid) &&
    isNonEmptyString(value.data.total_cobrado)
  )
}

const getBackendMessage = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value
  if (!isRecord(value)) return null

  if (isNonEmptyString(value.error)) return value.error
  if (isNonEmptyString(value.message)) return value.message

  return null
}

const getHttpFallbackMessage = (status: number): string => {
  if (status === 401) return 'La sesión no está autorizada para crear pedidos.'
  if (status === 403) return 'Tu rol no tiene permiso para crear pedidos.'
  return 'El servidor rechazó la solicitud de creación del pedido.'
}

const INITIAL_STATE: CreateOrderState = { status: 'idle' }

export const useCreateOrder = () => {
  const [state, setState] = useState<CreateOrderState>(INITIAL_STATE)
  const requestInFlightRef = useRef(false)
  const uncertainOutcomeRef = useRef(false)

  const submitOrder = useCallback(async (request: CreateOrderRequest) => {
    if (requestInFlightRef.current || uncertainOutcomeRef.current) return

    requestInFlightRef.current = true
    setState({ status: 'submitting' })

    try {
      const response: unknown = await createOrder(request)

      if (isSuccessResponse(response)) {
        setState({ status: 'success', response })
        return
      }

      if (isRecord(response) && response.ok === false) {
        setState({
          status: 'error',
          message: getBackendMessage(response) ??
            'El backend rechazó la creación del pedido.'
        })
        return
      }

      uncertainOutcomeRef.current = true
      setState({
        status: 'uncertain',
        message: 'El servidor respondió con datos inesperados. No es posible confirmar si el pedido fue creado; verifica el resultado antes de volver a intentarlo.'
      })
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response) {
        const httpStatus: number = error.response.status
        const backendMessage = getBackendMessage(error.response.data)

        if (httpStatus >= 500) {
          uncertainOutcomeRef.current = true
          setState({
            status: 'uncertain',
            httpStatus,
            message: backendMessage
              ? `${backendMessage} No se puede confirmar si el pedido fue creado; verifica el resultado antes de volver a intentarlo.`
              : 'El servidor encontró un error y no es posible confirmar si el pedido fue creado. Verifica el resultado antes de volver a intentarlo.'
          })
          return
        }

        setState({
          status: 'error',
          httpStatus,
          message: backendMessage ?? getHttpFallbackMessage(httpStatus)
        })
        return
      }

      uncertainOutcomeRef.current = true
      setState({
        status: 'uncertain',
        message: 'Se perdió la conexión durante el envío. El pedido pudo haberse creado; verifica el resultado antes de volver a intentarlo.'
      })
    } finally {
      requestInFlightRef.current = false
    }
  }, [])

  const reset = useCallback(() => {
    if (requestInFlightRef.current || uncertainOutcomeRef.current) return
    setState(INITIAL_STATE)
  }, [])

  return {
    state,
    status: state.status,
    isSubmitting: state.status === 'submitting',
    successResponse: state.status === 'success' ? state.response : null,
    errorMessage:
      state.status === 'error' || state.status === 'uncertain'
        ? state.message
        : null,
    submitOrder,
    reset
  }
}
