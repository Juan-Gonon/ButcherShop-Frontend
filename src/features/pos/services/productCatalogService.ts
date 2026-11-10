import api from '../../../lib/api/api'
import type { ProductCatalogResponse } from '../types/productCatalog'

export const getProductCatalog = async (
  signal?: AbortSignal
): Promise<ProductCatalogResponse> => {
  const response = await api.get<ProductCatalogResponse>(
    '/productos-carniceria',
    { signal }
  )

  return response.data
}
