import { useMemo } from 'react'
import { LuPackageOpen } from 'react-icons/lu'
import { Button } from '../../../components/ui/Button'
import { ProductCard } from './ProductCard'
import type {
  ButcheryProduct,
  ProductCategoryFilter
} from '../types/productCatalog'
import type { ProductCatalogStatus } from '../hooks/useProductCatalog'

interface ProductGridProps {
  products: ButcheryProduct[] | null
  status: ProductCatalogStatus
  error: string | null
  category: ProductCategoryFilter
  onAdd: (product: ButcheryProduct) => void
  isAddDisabled?: boolean
  onRetry: () => void
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es')

const matchesCategory = (
  product: ButcheryProduct,
  category: ProductCategoryFilter
) => {
  if (category === 'all') return true
  if (category === 'Res' || category === 'Cerdo' || category === 'Aves') {
    return normalize(product.producto_catalogo.categoria.tipo_carne.nombre) === normalize(category)
  }

  // Only exact real category names are matched; no inferred category groups.
  return normalize(product.producto_catalogo.categoria.nombre) === normalize(category)
}

const ProductCardSkeleton = () => (
  <div aria-hidden='true' className='animate-pulse rounded-2xl bg-white p-3 shadow-sm sm:p-4'>
    <div className='mb-3 flex items-center justify-between'>
      <div className='h-5 w-20 rounded-full bg-stone-100' />
      <div className='h-9 w-9 rounded-full bg-stone-100' />
    </div>
    <div className='h-24 rounded-xl bg-[#f6ece3] sm:h-28' />
    <div className='mt-3 h-3 w-16 rounded bg-stone-100' />
    <div className='mt-2 h-4 w-3/4 rounded bg-stone-100' />
    <div className='mt-5 h-5 w-1/2 rounded bg-stone-100' />
  </div>
)

export const ProductGrid = ({
  products,
  status,
  error,
  category,
  onAdd,
  isAddDisabled = false,
  onRetry
}: ProductGridProps) => {
  const availableProducts = useMemo(
    () => products?.filter((product) => product.disponible === true) ?? [],
    [products]
  )
  const filteredProducts = useMemo(
    () => availableProducts.filter((product) => matchesCategory(product, category)),
    [availableProducts, category]
  )

  if (status === 'loading') {
    return (
      <div className='grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 sm:gap-4' aria-label='Cargando productos'>
        {Array.from({ length: 8 }, (_, index) => <ProductCardSkeleton key={index} />)}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className='rounded-2xl border border-red-100 bg-white p-6 text-center'>
        <p role='alert' className='text-sm text-red-700'>{error}</p>
        <Button type='button' variant='outline' onClick={onRetry} className='mx-auto mt-4 w-auto py-2.5'>
          Reintentar
        </Button>
      </div>
    )
  }

  if (status === 'empty' || products === null) {
    return (
      <div className='rounded-2xl border border-stone-100 bg-white/70 px-5 py-10 text-center'>
        <LuPackageOpen aria-hidden='true' className='mx-auto h-8 w-8 text-stone-400' />
        <p className='mt-3 text-sm text-stone-600'>El catálogo está vacío.</p>
      </div>
    )
  }

  if (availableProducts.length === 0) {
    return (
      <div className='rounded-2xl border border-stone-100 bg-white/70 px-5 py-10 text-center'>
        <LuPackageOpen aria-hidden='true' className='mx-auto h-8 w-8 text-stone-400' />
        <p className='mt-3 text-sm text-stone-600'>No hay productos disponibles para seleccionar.</p>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className='rounded-2xl border border-stone-100 bg-white/70 px-5 py-10 text-center'>
        <LuPackageOpen aria-hidden='true' className='mx-auto h-8 w-8 text-stone-400' />
        <p className='mt-3 text-sm text-stone-600'>No hay productos disponibles en esta categoría.</p>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 sm:gap-4'>
      {filteredProducts.map((product) => (
        <ProductCard key={product.uuid} product={product} onAdd={onAdd} isAddDisabled={isAddDisabled} />
      ))}
    </div>
  )
}
