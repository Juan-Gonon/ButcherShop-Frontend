import api from '../../../lib/api/api'
import type {
  ConsumerFinal,
  ConsumerFinalResponse
} from '../types/consumerFinal'

export const getConsumerFinal = async (
  signal?: AbortSignal
): Promise<ConsumerFinal> => {
  const response = await api.get<ConsumerFinalResponse>(
    '/clients/consumidor-final',
    { signal }
  )

  return response.data.data
}
