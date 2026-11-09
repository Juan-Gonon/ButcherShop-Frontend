export type VolumeDispatchPeriod = 'hoy' | 'semana' | 'mes'
export type VolumeDispatchUnit = 'lb' | 'kg'

export interface VolumeDispatchParams {
  periodo: VolumeDispatchPeriod
  unidad: VolumeDispatchUnit
}

export interface VolumeDispatchItem {
  tipo_carne_id: string
  tipo_carne_nombre: string
  cantidad: number
  porcentaje: number
}

export interface VolumeDispatchData {
  id_carniceria: number
  periodo_aplicado: VolumeDispatchPeriod
  unidad_medida: VolumeDispatchUnit
  desde: string
  hasta: string
  volumen_total_general: number
  desglose: VolumeDispatchItem[]
}

export interface VolumeDispatchResponse {
  ok: true
  data: VolumeDispatchData
}
