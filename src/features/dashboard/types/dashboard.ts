export interface DashboardVolumeItem {
  unidad_venta: string
  abreviatura: string
  cantidad: string
}

export interface DashboardFeaturedProduct {
  id_producto_catalogo: string
  producto: string
  categoria: string
  tipo_carne: string
  unidad_venta: string
  abreviatura: string
  ingreso: string
  cantidad: string
}

export interface DashboardSummaryData {
  total_vendido: string
  pedidos_entregados: string
  ticket_promedio: string
  total_envios: string
  volumen_vendido: DashboardVolumeItem[]
  producto_estrella: DashboardFeaturedProduct | null
}

export interface DashboardSummaryResponse {
  ok: true
  data: DashboardSummaryData
}

export interface DashboardSummaryParams {
  desde: string
  hasta: string
}

export type DashboardPeriod = 'hoy' | 'ayer'
