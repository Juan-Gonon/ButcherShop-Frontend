import api from '../../../lib/api/api'
import type {
  KdsOrdersResponse,
  KdsOrdersSuccessResponse,
  KdsOrderStateTransitionRequest,
  KdsOrderStateTransitionResponse,
  KdsOrderStateTransitionSuccessResponse,
  KdsOrdersFilters
} from '../types/kds'

export const getOrdersByState = async (
  filters: KdsOrdersFilters,
  signal?: AbortSignal
): Promise<KdsOrdersSuccessResponse> => {
  const response = await api.get<KdsOrdersResponse>('/pedidos', {
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
