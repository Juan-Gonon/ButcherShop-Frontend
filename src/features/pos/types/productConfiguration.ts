import type { ButcheryProduct } from './productCatalog'

export interface ConfiguredProduct {
  producto: ButcheryProduct
  cantidad: number
  id_tipo_preparacion: string | null
  observaciones: string | null
  precio_unitario: string
  subtotal: number
}
