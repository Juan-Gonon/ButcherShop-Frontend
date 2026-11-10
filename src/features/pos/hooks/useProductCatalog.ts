import { useCallback, useEffect, useState } from 'react'
import { getProductCatalog } from '../services/productCatalogService'
import type { ButcheryProduct } from '../types/productCatalog'

export type ProductCatalogStatus = 'loading' | 'error' | 'empty' | 'success'

interface ProductCatalogResult {
  request: number
  data: ButcheryProduct[]
  status: Exclude<ProductCatalogStatus, 'loading'>
  error: string | null
}

export const useProductCatalog = () => {
  const [retryCount, setRetryCount] = useState(0)
  const [queryResult, setQueryResult] =
    useState<ProductCatalogResult | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getProductCatalog(controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return

        setQueryResult({
          request: retryCount,
          data: response.data,
          status: response.data.length === 0 ? 'empty' : 'success',
          error: null
        })
      })
      .catch(() => {
        if (controller.signal.aborted) return

        setQueryResult({
          request: retryCount,
          data: [],
          status: 'error',
          error: 'No se pudo cargar el catálogo de productos. Intenta de nuevo.'
        })
      })

    return () => controller.abort()
  }, [retryCount])

  const currentResult =
    queryResult?.request === retryCount ? queryResult : null
  const status: ProductCatalogStatus = currentResult?.status ?? 'loading'

  const retry = useCallback(() => {
    setRetryCount((count) => count + 1)
  }, [])

  return {
    data: currentResult?.data ?? null,
    isLoading: status === 'loading',
    error: currentResult?.error ?? null,
    status,
    retry
  }
}
