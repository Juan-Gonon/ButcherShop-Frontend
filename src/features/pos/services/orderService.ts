import api from '../../../lib/api/api'
import type {
  CreateOrderRequest,
  CreateOrderResponse
} from '../types/createOrder'

export const createOrder = async (
  request: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  const response = await api.post<CreateOrderResponse>('/pedidos/', request)
  return response.data
}
