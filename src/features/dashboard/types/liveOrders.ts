export interface LiveOrderDetail {
  cantidad: string
  unidad: string
  producto: string
  preparacion: string
  observaciones: string
}

export interface LiveOrder {
  uuid: string
  id_pedido: string
  cliente: string
  canal_origen: string
  tipo_entrega: string
  estado: string
  fecha: string
  total: string
  detalles: LiveOrderDetail[]
}

export interface LiveOrdersResponse {
  ok: boolean
  data: LiveOrder[]
}
