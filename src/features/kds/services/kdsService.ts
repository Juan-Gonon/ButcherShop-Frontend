import api from '../../../lib/api/api'
import type {
  KdsConfirmedOrdersResponse,
  KdsConfirmedOrdersSuccessResponse,
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
