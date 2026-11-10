import {
  useEffect,
  useRef,
  useState,
  type MouseEvent
} from 'react'
import { createPortal } from 'react-dom'
import {
  LuBeef,
  LuCheck,
  LuMinus,
  LuPlus,
  LuX
} from 'react-icons/lu'
import { Button } from '../../../components/ui/Button'
import type { Preparation, PreparationsStatus } from '../types/preparation'
import type { ButcheryProduct } from '../types/productCatalog'
import type { ConfiguredProduct } from '../types/productConfiguration'
import {
  getQuantityStep,
  validateProductQuantity
} from '../utils/productQuantity'

interface ProductConfigurationModalProps {
  product: ButcheryProduct
  preparations: Preparation[]
  preparationsStatus: PreparationsStatus
  preparationsError: string | null
  onRetryPreparations: () => void
  onClose: () => void
  onConfirm: (configuration: ConfiguredProduct) => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2
  }).format(value)

const formatQuantity = (value: number) =>
  Number(value.toFixed(2)).toString()

export const ProductConfigurationModal = ({
  product,
  preparations,
  preparationsStatus,
  preparationsError,
  onRetryPreparations,
  onClose,
  onConfirm
}: ProductConfigurationModalProps) => {
  const [quantityInput, setQuantityInput] = useState('1')
  const [selectedPreparationId, setSelectedPreparationId] = useState<string | null>(null)
  const [observations, setObservations] = useState('')
  const [imageFailed, setImageFailed] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const quantityError = validateProductQuantity(quantityInput, product.unidad_venta)
  const quantity = Number(quantityInput)
  const unitPrice = Number(product.precio)
  const validPrice = Number.isFinite(unitPrice) && unitPrice >= 0
  const rawSubtotal = quantity * unitPrice
  const subtotal = Number.isFinite(rawSubtotal)
    ? Math.round((rawSubtotal + Number.EPSILON) * 100) / 100
    : 0
  const unitStep = getQuantityStep(product.unidad_venta)
  const unitLabel = product.unidad_venta.abreviatura || product.unidad_venta.nombre
  const selectedPreparation = preparations.find(
    (preparation) => preparation.id === selectedPreparationId
  ) ?? null

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [onClose])

  const changeQuantity = (delta: number) => {
    const current = Number(quantityInput)
    const base = Number.isFinite(current) ? current : 0
    const next = Math.min(300, Math.max(0, base + delta))
    setQuantityInput(formatQuantity(next))
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose()
  }

  const handleConfirm = () => {
    if (quantityError || !validPrice || !Number.isFinite(subtotal)) return

    const configuration: ConfiguredProduct = {
      producto: product,
      cantidad: quantity,
      id_tipo_preparacion: selectedPreparation?.id ?? null,
      observaciones: observations.trim() || null,
      precio_unitario: product.precio,
      subtotal
    }

    onConfirm(configuration)
    onClose()
  }

  return createPortal(
    <div
      className='fixed inset-0 z-[100] flex items-end justify-center bg-stone-950/45 p-2 backdrop-blur-sm sm:items-center sm:p-4'
      onMouseDown={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby='product-config-title'
        aria-describedby='product-config-description'
        className='flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#debfbf]/30 bg-white shadow-[0_8px_30px_rgba(92,77,60,0.24)] sm:max-h-[92dvh]'
      >
        <header className='flex shrink-0 items-center justify-between gap-3 border-b border-[#f0e7de] bg-[#fbf2e9] px-4 py-3 sm:px-5'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f0e7de] text-primary'>
              {product.producto_catalogo.imagen_url && !imageFailed ? (
                <img
                  src={product.producto_catalogo.imagen_url}
                  alt=''
                  onError={() => setImageFailed(true)}
                  className='h-full w-full object-cover'
                />
              ) : (
                <LuBeef aria-hidden='true' className='h-6 w-6' />
              )}
            </div>
            <div className='min-w-0'>
              <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1'>
                <h2 id='product-config-title' className='truncate text-base font-bold leading-tight text-stone-900 sm:text-lg'>
                  {product.producto_catalogo.nombre}
                </h2>
                <span className='rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary'>
                  {product.producto_catalogo.categoria.nombre}
                </span>
              </div>
              <p id='product-config-description' className='mt-1 text-sm font-semibold text-primary'>
                {formatCurrency(unitPrice)} / {unitLabel}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type='button'
            aria-label='Cerrar configuración de producto'
            onClick={onClose}
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0e7de] text-stone-600 transition hover:bg-stone-200 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary/30'
          >
            <LuX aria-hidden='true' className='h-5 w-5' />
          </button>
        </header>

        <div className='min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5'>
          <section aria-labelledby='quantity-title' className='rounded-xl border border-[#f0e7de] bg-[#fbf2e9] p-3 sm:p-4'>
            <div className='mb-3 flex items-center justify-between gap-3'>
              <h3 id='quantity-title' className='text-xs font-bold uppercase tracking-wider text-stone-600'>
                Cantidad
              </h3>
              <span className='text-xs font-medium text-stone-500'>Unidad: {product.unidad_venta.nombre}</span>
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                aria-label={`Reducir ${unitStep} ${unitLabel}`}
                onClick={() => changeQuantity(-unitStep)}
                className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-stone-700 shadow-sm transition hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-primary/30'
              >
                <LuMinus aria-hidden='true' className='h-4 w-4' />
              </button>
              <label className='flex min-w-0 flex-1 items-center rounded-xl border border-[#eae1d8] bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15'>
                <span className='sr-only'>Cantidad de {product.producto_catalogo.nombre}</span>
                <input
                  type='number'
                  inputMode='decimal'
                  min='0'
                  max='300'
                  step={unitStep === 0.25 ? 'any' : '1'}
                  value={quantityInput}
                  onChange={(event) => setQuantityInput(event.target.value)}
                  className='h-11 w-full min-w-0 bg-transparent text-center text-xl font-bold text-primary outline-none'
                />
                <span className='shrink-0 pl-2 text-sm font-semibold text-stone-500'>{unitLabel}</span>
              </label>
              <button
                type='button'
                aria-label={`Aumentar ${unitStep} ${unitLabel}`}
                onClick={() => changeQuantity(unitStep)}
                className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30'
              >
                <LuPlus aria-hidden='true' className='h-4 w-4' />
              </button>
            </div>
            {quantityError && (
              <p className='mt-2 text-xs text-red-700' role='alert'>{quantityError}</p>
            )}
            {!validPrice && (
              <p className='mt-2 text-xs text-red-700' role='alert'>El precio del producto no es válido.</p>
            )}
          </section>

          <section aria-labelledby='preparations-title'>
            <div className='mb-3 flex items-center justify-between gap-2'>
              <h3 id='preparations-title' className='text-xs font-bold uppercase tracking-wider text-stone-600'>
                Tipo de preparación / corte
              </h3>
              <span className='text-xs text-stone-500'>Opcional</span>
            </div>

            {preparationsStatus === 'loading' && (
              <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3' role='status' aria-label='Cargando preparaciones'>
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} aria-hidden='true' className='h-[4.5rem] animate-pulse rounded-xl bg-[#f0e7de]' />
                ))}
              </div>
            )}

            {preparationsStatus === 'error' && (
              <div className='rounded-xl border border-red-100 bg-red-50/70 p-3'>
                <p role='alert' className='text-sm text-red-700'>{preparationsError}</p>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onRetryPreparations}
                  className='mt-3 w-auto px-4 py-2.5'
                >
                  Reintentar
                </Button>
                <p className='mt-2 text-xs text-stone-500'>También puedes continuar sin seleccionar preparación.</p>
              </div>
            )}

            {preparationsStatus === 'empty' && (
              <p role='status' className='rounded-xl bg-[#fbf2e9] p-3 text-sm text-stone-600'>
                No hay preparaciones configuradas. Puedes continuar sin seleccionar una.
              </p>
            )}

            {preparationsStatus === 'success' && (
              <>
                <div className='mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3'>
                  {preparations.map((preparation) => {
                    const isSelected = selectedPreparationId === preparation.id

                    return (
                      <button
                        key={preparation.id}
                        type='button'
                        aria-pressed={isSelected}
                        onClick={() => setSelectedPreparationId(isSelected ? null : preparation.id)}
                        className={`min-w-0 rounded-xl border p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                          isSelected
                            ? 'border-primary bg-primary text-white shadow-sm'
                            : 'border-transparent bg-[#f0e7de] text-stone-800 hover:bg-[#eae1d8]'
                        }`}
                      >
                        <span className='flex items-start justify-between gap-2'>
                          <span className='text-sm font-semibold leading-snug'>{preparation.nombre}</span>
                          {isSelected && <LuCheck aria-hidden='true' className='h-4 w-4 shrink-0' />}
                        </span>
                        {
                          /*
                        <span className={`mt-1 block text-xs leading-relaxed ${isSelected ? 'text-white/85' : 'text-stone-600'}`}>
                          {preparation.descripcion}
                        </span>
                          */
                        }
                  
                      </button>
                    )
                  })}
                </div>
                <button
                  type='button'
                  aria-pressed={selectedPreparationId === null}
                  onClick={() => setSelectedPreparationId(null)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    selectedPreparationId === null
                      ? 'bg-secondary/10 text-secondary'
                      : 'text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  Sin preparación
                </button>
              </>
            )}
          </section>

          <section aria-labelledby='observations-title'>
            <label htmlFor='product-observations' id='observations-title' className='mb-2 block text-xs font-bold uppercase tracking-wider text-stone-600'>
              Observaciones (opcional)
            </label>
            <textarea
              id='product-observations'
              value={observations}
              onChange={(event) => setObservations(event.target.value)}
              maxLength={255}
              rows={3}
              placeholder='Ej. Cortar delgado y empacar por separado.'
              className='w-full resize-y rounded-xl border border-transparent bg-[#f6ece3] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15'
            />
            <p className='mt-1 text-right text-xs text-stone-500'>{observations.length}/255</p>
          </section>

          <section aria-label='Subtotal calculado' className='flex items-center justify-between gap-3 rounded-xl bg-[#f0e7de] p-3 sm:p-4'>
            <div className='min-w-0'>
              <p className='text-xs font-medium text-stone-600'>Subtotal calculado</p>
              <p className='mt-1 truncate text-xs text-stone-500'>
                {formatQuantity(Number.isFinite(quantity) ? quantity : 0)} {unitLabel} × {formatCurrency(validPrice ? unitPrice : 0)}
              </p>
            </div>
            <p className='shrink-0 text-xl font-bold leading-none text-primary sm:text-2xl'>
              {formatCurrency(subtotal)}
            </p>
          </section>
        </div>

        <footer className='flex shrink-0 flex-col-reverse gap-2 border-t border-[#f0e7de] bg-[#fbf2e9] px-4 py-3 sm:flex-row sm:justify-end sm:px-5'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-[#f0e7de] hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary/30'
          >
            Cancelar
          </button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={Boolean(quantityError) || !validPrice || preparationsStatus === 'loading'}
            className='w-full py-2.5 sm:w-auto'
          >
            <span className='inline-flex items-center gap-2'>
              <LuPlus aria-hidden='true' className='h-4 w-4' />
              Confirmar y agregar
            </span>
          </Button>
        </footer>
      </div>
    </div>,
    document.body
  )
}
