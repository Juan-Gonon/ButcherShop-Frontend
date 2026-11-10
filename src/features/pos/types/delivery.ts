export type DeliveryMode = 'storePickup' | 'homeDelivery'

export type OrderDeliveryPayload =
  | { id_tipo_entrega: 1; id_direccion_envio: null }
  | { id_tipo_entrega: 2; id_direccion_envio: number }

export type DeliveryPayloadResult =
  | { valid: true; payload: OrderDeliveryPayload }
  | { valid: false; reason: 'sector-required' | 'invalid-sector-id' }
