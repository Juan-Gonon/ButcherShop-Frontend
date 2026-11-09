import api from '../../../lib/api/api'
import type { ClientSearchResponse } from '../types/clientSearch'

export const searchClients = async (
  query: string,
  signal?: AbortSignal
) => {
  const response = await api.get<ClientSearchResponse>('/clients/search', {
    params: { query },
    signal
  })

  return response.data.clients
}
