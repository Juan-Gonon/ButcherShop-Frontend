export interface ShippingSector {
  id: string
  nombre_sector: string
  costo_envio: string
}

export interface ShippingSectorsResponse {
  ok: true
  addresses: ShippingSector[]
}

export type ShippingSectorSelection = ShippingSector | null
