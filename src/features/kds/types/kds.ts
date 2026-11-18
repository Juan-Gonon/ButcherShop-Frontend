export type KdsOrderState =
  | 'Pendiente'
  | 'Confirmado'
  | 'En preparación'
  | 'En camino'
  | 'Entregado'
  | 'Cancelado'

export type KdsDeliveryType = 'Recoger en tienda' | 'A domicilio'

export interface KdsOrdersFilters {
  estado: KdsOrderState
  page: number
  pageSize: number
}

export interface KdsPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface KdsCustomer {
  uuid: string
  nombre: string
  telefono: string | null
}

export interface KdsOrderDetail {
  id_detalle_pedido: string
  cantidad: string
  precio_unitario: string
  subtotal: string
  observaciones: string | null
  producto: string
  unidad: string
  preparacion: string | null
}

/** Pedido con los campos observados en la respuesta del listado KDS. */
export interface KdsOrder {
  uuid: string
  id_pedido: string
  canal_origen: string
  fecha: string
  estado: KdsOrderState
  tipo_entrega: KdsDeliveryType
  costo_envio: string
  total: string
  version: number
  cliente: KdsCustomer
  /** La forma de la dirección no está documentada en este contrato. */
  direccion_envio: unknown
  detalles: KdsOrderDetail[]
}

export type KdsOrderWithState<State extends KdsOrderState> = Omit<KdsOrder, 'estado'> & {
  estado: State
}

export type KdsConfirmedOrder = KdsOrderWithState<'Confirmado'>
export type KdsPreparingOrder = KdsOrderWithState<'En preparación'>

export interface KdsApiErrorResponse {
  ok: false
  error: string
}

export interface KdsOrdersSuccessResponse {
  ok: true
  data: {
    items: KdsOrder[]
    pagination: KdsPagination
  }
}

export type KdsOrdersResponse =
  | KdsOrdersSuccessResponse
  | KdsApiErrorResponse

export interface KdsOrderStateTransitionRequest {
  estado_actual_esperado: KdsOrderState
  estado_destino: KdsOrderState
}

export interface KdsOrderStateTransitionSuccessResponse {
  ok: true
  data: Pick<KdsOrder, 'uuid' | 'estado'>
}

export type KdsOrderStateTransitionResponse =
  | KdsOrderStateTransitionSuccessResponse
  | KdsApiErrorResponse
