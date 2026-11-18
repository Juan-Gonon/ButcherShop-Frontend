import api from '../../../lib/api/api'
import type {
  KdsConfirmedOrdersResponse,
  KdsConfirmedOrdersSuccessResponse,
  KdsOrderStateTransitionRequest,
  KdsOrderStateTransitionResponse,
  KdsOrderStateTransitionSuccessResponse,
  KdsOrdersFilters
} from '../types/kds'

export const getConfirmedOrders = async (
  filters: KdsOrdersFilters,
  signal?: AbortSignal
): Promise<KdsConfirmedOrdersSuccessResponse> => {
  const response = await api.get<KdsConfirmedOrdersResponse>('/pedidos', {
    params: filters,
    signal
  })

  if (!response.data.ok) {
    throw new Error(response.data.error)
  }

  return response.data
}

export const transitionOrderState = async (
  uuid: string,
  transition: KdsOrderStateTransitionRequest
): Promise<KdsOrderStateTransitionSuccessResponse> => {
  const response = await api.patch<KdsOrderStateTransitionResponse>(
    `/pedidos/${uuid}/estado`,
    transition
  )

  if (!response.data.ok) {
    throw new Error(response.data.error)
  }

  return response.data
}
