import type { ButcheryProduct } from './productCatalog'

export interface CartLine {
  lineId: string
  producto: ButcheryProduct
  cantidad: number
  id_tipo_preparacion: string | null
  nombre_preparacion: string | null
  observaciones: string | null
  precio_unitario: string
}

export interface CartState {
  lines: CartLine[]
  nextLineId: number
  validationError: string | null
}

export interface CartLineSummary extends CartLine {
  subtotal: number
}

export interface CartSummary {
  lines: CartLineSummary[]
  lineCount: number
  total: number
}

export interface SetLineQuantityPayload {
  lineId: string
  cantidad: number
}

export interface SetLinePreparationPayload {
  lineId: string
  id_tipo_preparacion: string | null
  nombre_preparacion: string | null
}

export interface SetLineObservationsPayload {
  lineId: string
  observaciones: string | null
}

export interface RemoveCartLinePayload {
  lineId: string
}
