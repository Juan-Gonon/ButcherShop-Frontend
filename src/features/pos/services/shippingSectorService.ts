import api from '../../../lib/api/api'
import type { ShippingSector, ShippingSectorsResponse } from '../types/shippingSector'

export const getShippingSectors = async (
  signal?: AbortSignal
): Promise<ShippingSector[]> => {
  const response = await api.get<ShippingSectorsResponse>(
    '/direcciones-envio/',
    { signal }
  )

  return response.data.addresses
}
