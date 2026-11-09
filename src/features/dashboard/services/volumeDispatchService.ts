import api from '../../../lib/api/api'
import type {
  VolumeDispatchData,
  VolumeDispatchParams,
  VolumeDispatchResponse
} from '../types/volumeDispatch'

export const getVolumeDispatch = async (
  params: VolumeDispatchParams,
  signal?: AbortSignal
): Promise<VolumeDispatchData> => {
  const response = await api.get<VolumeDispatchResponse>('/pedidos/volume-despacho', {
    params,
    signal
  })

  return response.data.data
}
