export interface ProductMeatType {
  id: string
  nombre: string
}

export interface ProductCategory {
  id: string
  nombre: string
  tipo_carne: ProductMeatType
}

export interface ProductCatalogItem {
  uuid: string
  nombre: string
  descripcion_general: string
  imagen_url: string
  categoria: ProductCategory
}

export interface ProductSalesUnit {
  id: string
  nombre: string
  abreviatura: string
}

export interface ButcheryProduct {
  uuid: string
  id: string
  precio: string
  disponible: boolean
  maneja_inventario: boolean
  stock_actual: number | null
  producto_catalogo: ProductCatalogItem
  unidad_venta: ProductSalesUnit
}

export interface ProductCatalogPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ProductCatalogMetrics {
  stock_critico_umbral: number
  total_productos_stock_critico: number
}

export interface ProductCatalogResponse {
  ok: true
  data: ButcheryProduct[]
  pagination?: ProductCatalogPagination
  metrics?: ProductCatalogMetrics
}

export type ProductCategoryFilter =
  | 'all'
  | 'Res'
  | 'Cerdo'
  | 'Aves'
  | 'Embutidos & Especiales'
  | 'Madurados'
