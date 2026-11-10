import type { DeliveryMode, DeliveryPayloadResult } from '../types/delivery'
import type { ShippingSectorSelection } from '../types/shippingSector'

export const buildDeliveryPayload = (
  mode: DeliveryMode,
  selectedSector: ShippingSectorSelection
): DeliveryPayloadResult => {
  if (mode === 'storePickup') {
    return {
      valid: true,
      payload: {
        id_tipo_entrega: 1,
        id_direccion_envio: null
      }
    }
  }

  if (!selectedSector) {
    return { valid: false, reason: 'sector-required' }
  }

  const shippingSectorId = Number(selectedSector.id)
  if (!Number.isSafeInteger(shippingSectorId) || shippingSectorId <= 0) {
    return { valid: false, reason: 'invalid-sector-id' }
  }

  return {
    valid: true,
    payload: {
      id_tipo_entrega: 2,
      id_direccion_envio: shippingSectorId
    }
  }
}
