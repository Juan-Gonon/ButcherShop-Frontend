import api from '../../../lib/api/api'
import type { LiveOrdersResponse } from '../types/liveOrders'

export const getLiveOrders = async (
  signal?: AbortSignal
): Promise<LiveOrdersResponse> => {
  const response = await api.get<LiveOrdersResponse>('/pedidos/live', { signal })
  return response.data
}
