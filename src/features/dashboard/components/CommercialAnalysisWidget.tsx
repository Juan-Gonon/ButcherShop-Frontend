import { FiAlertCircle, FiAward, FiDollarSign, FiPackage, FiRefreshCw, FiTag } from 'react-icons/fi'
import type { DashboardFeaturedProduct } from '../types/dashboard'

type DashboardStatus = 'loading' | 'error' | 'empty' | 'success'

interface CommercialAnalysisWidgetProps {
  product: DashboardFeaturedProduct | null
  status: DashboardStatus
  error: string | null
  onRetry: () => void
}

const getText = (value: string | undefined) => value?.trim() || null

const getNumericValue = (value: string | undefined) => {
  if (!value?.trim()) return null
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const formatMoney = (value: string) => {
  const numericValue = getNumericValue(value)
  if (numericValue === null) return null

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue)
}

const formatQuantity = (value: string) => {
  const numericValue = getNumericValue(value)
  if (numericValue === null) return null

  return new Intl.NumberFormat('es-GT', { maximumFractionDigits: 2 }).format(numericValue)
}

const LoadingState = () => (
  <div aria-label='Cargando análisis comercial' aria-live='polite' className='animate-pulse space-y-4'>
    <div className='h-3 w-28 rounded bg-bg-light' />
    <div className='h-8 w-3/4 rounded-lg bg-bg-light/80' />
    <div className='h-12 w-1/2 rounded-lg bg-bg-light' />
    <div className='grid grid-cols-2 gap-3 pt-2'>
      <div className='h-14 rounded-xl bg-bg-light/70' />
      <div className='h-14 rounded-xl bg-bg-light/70' />
    </div>
  </div>
)

export const CommercialAnalysisWidget = ({ product, status, error, onRetry }: CommercialAnalysisWidgetProps) => {
  const name = getText(product?.producto)
  const revenue = product ? formatMoney(product.ingreso) : null
  const quantity = product ? formatQuantity(product.cantidad) : null
  const unit = product ? getText(product.unidad_venta) : null
  const abbreviation = product ? getText(product.abreviatura) : null
  const category = product ? getText(product.categoria) : null
  const meatType = product ? getText(product.tipo_carne) : null
  const quantityLabel = quantity
    ? [quantity, unit, abbreviation && abbreviation !== unit ? `(${abbreviation})` : null].filter(Boolean).join(' ')
    : null

  return (
    <section aria-labelledby='commercial-analysis-title' className='min-w-0 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-[0_12px_34px_-16px_rgba(92,77,60,0.22)] backdrop-blur-sm sm:p-5 lg:col-span-5'>
      <header className='flex items-start gap-3'>
        <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tertiary/55 text-xl text-primary'>
          <FiAward aria-hidden='true' />
        </span>
        <div className='min-w-0'>
          <h2 className='font-headline text-lg font-semibold tracking-tight text-neutral sm:text-xl' id='commercial-analysis-title'>Análisis comercial</h2>
          <p className='mt-1 text-sm text-neutral/85'>Producto estrella del período seleccionado.</p>
        </div>
      </header>

      <div aria-live='polite' className='mt-5 min-w-0'>
        {status === 'loading' && <LoadingState />}

        {status === 'error' && (
          <div className='rounded-2xl border border-primary/15 bg-primary/5 p-4'>
            <p className='flex items-start gap-2 text-sm font-medium text-primary'>
              <FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />
              {error ?? 'No se pudo cargar el análisis comercial.'}
            </p>
            <button
              className='mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              onClick={onRetry}
              type='button'
            >
              <FiRefreshCw aria-hidden='true' /> Reintentar consulta
            </button>
          </div>
        )}

        {status !== 'loading' && status !== 'error' && !product && (
          <div className='flex min-h-44 flex-col items-center justify-center rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-6 text-center'>
            <span className='flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-secondary'>
              <FiAward aria-hidden='true' className='text-xl' />
            </span>
            <p className='mt-3 font-semibold text-neutral'>Sin producto estrella</p>
            <p className='mt-1 text-sm text-neutral/85'>No hay un producto destacado para este período.</p>
          </div>
        )}

        {product && status !== 'loading' && status !== 'error' && (
          <div className='min-w-0'>
            <div className='rounded-2xl bg-bg-light/45 p-4'>
              <p className='font-label text-[10px] font-medium uppercase tracking-[0.14em] text-neutral'>Producto estrella</p>
              {name && <h3 className='mt-1 break-words text-xl font-semibold tracking-tight text-primary sm:text-2xl'>{name}</h3>}
              {revenue && (
                <div className='mt-4 flex items-center gap-2'>
                  <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary'>
                    <FiDollarSign aria-hidden='true' />
                  </span>
                  <div className='min-w-0'>
                    <p className='text-xs font-medium text-neutral'>Ingresos generados</p>
                    <p className='break-words font-label text-xl font-semibold tabular-nums tracking-tight text-secondary'>{revenue}</p>
                  </div>
                </div>
              )}
            </div>

            <dl className='mt-3 grid min-w-0 grid-cols-2 gap-2'>
              {quantityLabel && (
                <div className='min-w-0 rounded-xl border border-bg-light/80 bg-white/70 p-3'>
                  <dt className='flex items-center gap-1.5 text-xs font-medium text-neutral'><FiPackage aria-hidden='true' /> Cantidad vendida</dt>
                  <dd className='mt-1 break-words font-label text-sm font-semibold tabular-nums text-neutral'>{quantityLabel}</dd>
                </div>
              )}
              {category && (
                <div className='min-w-0 rounded-xl border border-bg-light/80 bg-white/70 p-3'>
                  <dt className='flex items-center gap-1.5 text-xs font-medium text-neutral'><FiTag aria-hidden='true' /> Categoría</dt>
                  <dd className='mt-1 break-words text-sm font-semibold text-neutral'>{category}</dd>
                </div>
              )}
              {meatType && (
                <div className='min-w-0 rounded-xl border border-bg-light/80 bg-white/70 p-3'>
                  <dt className='flex items-center gap-1.5 text-xs font-medium text-neutral'><FiTag aria-hidden='true' /> Tipo de carne</dt>
                  <dd className='mt-1 break-words text-sm font-semibold text-neutral'>{meatType}</dd>
                </div>
              )}
            </dl>
            {!name && !revenue && !quantityLabel && !category && !meatType && (
              <p className='mt-3 rounded-xl bg-bg-light/45 p-3 text-sm text-neutral'>La respuesta no incluye información de presentación para este producto.</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
