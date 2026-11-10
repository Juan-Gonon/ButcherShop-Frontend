import api from '../../../lib/api/api'
import type { PreparationsResponse } from '../types/preparation'

export const getPreparations = async (
  signal?: AbortSignal
): Promise<PreparationsResponse> => {
  const response = await api.get<PreparationsResponse>('/preparations/', {
    signal
  })

  return response.data
}
