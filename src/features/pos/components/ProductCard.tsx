import { useState } from 'react'
import { LuBeef, LuPlus } from 'react-icons/lu'
import type { ButcheryProduct } from '../types/productCatalog'

interface ProductCardProps {
  product: ButcheryProduct
  onAdd: (product: ButcheryProduct) => void
}

const formatPrice = (price: string) => {
  const numericPrice = Number(price)
  if (!Number.isFinite(numericPrice)) return `Q ${price}`

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2
  }).format(numericPrice)
}

export const ProductCard = ({ product, onAdd }: ProductCardProps) => {
  const [imageFailed, setImageFailed] = useState(false)
  const { producto_catalogo: catalogProduct } = product
  const unitLabel = product.unidad_venta.abreviatura || product.unidad_venta.nombre

  return (
    <article className='group flex min-w-0 flex-col justify-between rounded-2xl bg-white p-3 shadow-[0_4px_16px_rgba(92,77,60,0.04)] transition-colors hover:bg-stone-50 sm:p-4'>
      <div>
        <div className='mb-3 flex min-w-0 items-center justify-between gap-2'>
          <span className='truncate rounded-full bg-secondary/10 px-2 py-1 text-[10px] font-semibold text-secondary sm:text-xs'>
            {catalogProduct.categoria.nombre}
          </span>
          <button
            type='button'
            onClick={() => onAdd(product)}
            aria-label={`Configurar ${catalogProduct.nombre}`}
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition hover:scale-105 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2'
          >
            <LuPlus aria-hidden='true' className='h-5 w-5' />
          </button>
        </div>

        <div className='mb-3 flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-[#f6ece3] sm:h-28'>
          {catalogProduct.imagen_url && !imageFailed ? (
            <img
              src={catalogProduct.imagen_url}
              alt={catalogProduct.nombre}
              loading='lazy'
              decoding='async'
              onError={() => setImageFailed(true)}
              className='h-full w-full object-cover transition-transform group-hover:scale-105'
            />
          ) : (
            <LuBeef aria-hidden='true' className='h-9 w-9 text-primary/35' />
          )}
        </div>

        <p className='text-[10px] font-medium uppercase tracking-wide text-stone-500 sm:text-xs'>
          {catalogProduct.categoria.tipo_carne.nombre}
        </p>
        <h3 className='mt-1 line-clamp-2 text-sm font-semibold leading-snug text-stone-900 sm:text-base'>
          {catalogProduct.nombre}
        </h3>
        {catalogProduct.descripcion_general && (
          <p className='mt-1 line-clamp-1 text-xs text-stone-500'>
            {catalogProduct.descripcion_general}
          </p>
        )}
      </div>

      <div className='mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 border-t border-stone-100 pt-3'>
        <span className='text-sm font-bold text-primary sm:text-base'>
          {formatPrice(product.precio)}
        </span>
        <span className='text-xs text-stone-500'>/ {unitLabel}</span>
      </div>
    </article>
  )
}
