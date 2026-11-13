export interface CreateOrderProductRequest {
  id_producto_carniceria: number
  id_tipo_preparacion: number | null
  cantidad: number
  observaciones: string | null
}

export interface CreateOrderRequest {
  cliente_uuid: string
  id_tipo_entrega: 1 | 2
  id_direccion_envio: number | null
  canal_origen: 'pos'
  productos: CreateOrderProductRequest[]
}

/** Response shapes observed during manual Postman verification. */
export interface CreateOrderSuccessResponse {
  ok: true
  data: {
    message: string
    id_pedido: string
    uuid: string
    total_cobrado: string
  }
}

/** Error shape observed during manual Postman verification. */
export interface CreateOrderErrorResponse {
  ok: false
  error: string
}

export type CreateOrderResponse =
  | CreateOrderSuccessResponse
  | CreateOrderErrorResponse

export interface BuildCreateOrderRequestInput {
  clienteUuid: string | null | undefined
  delivery: import('./delivery').DeliveryPayloadResult
  lines: readonly import('./cart').CartLine[]
}

export type BuildCreateOrderRequestErrorCode =
  | 'client-required'
  | 'invalid-client-uuid'
  | 'delivery-invalid'
  | 'cart-empty'
  | 'cart-too-large'
  | 'invalid-product-id'
  | 'invalid-preparation-id'
  | 'invalid-quantity'
  | 'invalid-observations'

export type BuildCreateOrderRequestResult =
  | { valid: true; request: CreateOrderRequest }
  | {
      valid: false
      code: BuildCreateOrderRequestErrorCode
      error: string
    }
