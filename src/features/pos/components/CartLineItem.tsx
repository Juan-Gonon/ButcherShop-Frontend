import { useState } from 'react'
import { LuBeef, LuChevronDown, LuChevronUp, LuMinus, LuPlus, LuTrash2 } from 'react-icons/lu'
import type { Preparation, PreparationsStatus } from '../types/preparation'
import type { CartLineSummary } from '../types/cart'
import { getQuantityStep } from '../utils/productQuantity'
import {
  addQuantities,
  centsToAmount,
  getPriceInCents
} from '../utils/cartCalculations'

interface CartLineItemProps {
  line: CartLineSummary
  preparations: Preparation[]
  preparationsStatus: PreparationsStatus
  onQuantityChange: (lineId: string, quantity: number) => void
  onPreparationChange: (
    lineId: string,
    preparation: Preparation | null
  ) => void
  onObservationsChange: (lineId: string, observations: string | null) => void
  onRemove: (lineId: string) => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2
  }).format(value)

export const CartLineItem = ({
  line,
  preparations,
  preparationsStatus,
  onQuantityChange,
  onPreparationChange,
  onObservationsChange,
  onRemove
}: CartLineItemProps) => {
  const [quantityDraft, setQuantityDraft] = useState<{
    base: number
    value: string
  } | null>(null)
  const [observationsDraft, setObservationsDraft] = useState<{
    base: string | null
    value: string
  } | null>(null)
  const [imageFailed, setImageFailed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const quantityInput = quantityDraft?.base === line.cantidad
    ? quantityDraft.value
    : String(line.cantidad)
  const observationsInput = observationsDraft?.base === line.observaciones
    ? observationsDraft.value
    : line.observaciones ?? ''
  const step = getQuantityStep(line.producto.unidad_venta)
  const priceInCents = getPriceInCents(line.precio_unitario)
  const unitPrice = priceInCents === null ? 0 : centsToAmount(priceInCents)
  const preparationOptionsAvailable = preparationsStatus !== 'loading'

  const commitQuantity = () => {
    const quantity = Number(quantityInput)
    onQuantityChange(line.lineId, quantity)
    setQuantityDraft(null)
  }

  const changeByStep = (amount: number) => {
    const next = addQuantities(line.cantidad, amount)
    onQuantityChange(line.lineId, next)
  }

  const selectPreparation = (preparationId: string) => {
    const preparation = preparations.find((item) => item.id === preparationId)
    onPreparationChange(line.lineId, preparation ?? null)
  }

  return (
    <article className='min-w-0 rounded-xl border border-stone-100 bg-white p-3 shadow-sm transition-shadow sm:p-4'>
      <div className='flex min-w-0 gap-3'>
        <div className='flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f6ece3] text-primary/40 sm:h-16 sm:w-16'>
          {line.producto.producto_catalogo.imagen_url && !imageFailed ? (
            <img
              src={line.producto.producto_catalogo.imagen_url}
              alt=''
              loading='lazy'
              decoding='async'
              onError={() => setImageFailed(true)}
              className='h-full w-full object-cover'
            />
          ) : (
            <LuBeef aria-hidden='true' className='h-6 w-6' />
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex min-w-0 items-start justify-between gap-2'>
            <div className='min-w-0'>
              <h3 className='break-words text-sm font-semibold text-stone-900'>
                {line.producto.producto_catalogo.nombre}
              </h3>
              <p className='mt-0.5 text-xs text-stone-500'>
                {formatCurrency(unitPrice)} / {line.producto.unidad_venta.abreviatura || line.producto.unidad_venta.nombre}
              </p>
            </div>
            <button
              type='button'
              data-cart-remove='true'
              onClick={() => onRemove(line.lineId)}
              aria-label={`Eliminar ${line.producto.producto_catalogo.nombre} del pedido`}
              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-500 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-300'
            >
              <LuTrash2 aria-hidden='true' className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>

      <div className='mt-2 flex min-w-0 items-center justify-between gap-2 border-t border-stone-100 pt-2'>
        <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1'>
          <span className='text-sm font-semibold text-stone-800'>
            {line.cantidad} {line.producto.unidad_venta.abreviatura || line.producto.unidad_venta.nombre}
          </span>
          <span className='text-sm font-bold text-primary'>{formatCurrency(line.subtotal)}</span>
          {(line.nombre_preparacion || line.observaciones) && (
            <span className='inline-flex items-center rounded-full bg-[#f6ece3] px-2 py-0.5 text-[10px] font-medium text-stone-600'>
              {line.nombre_preparacion && line.observaciones
                ? 'Preparación · Nota'
                : line.nombre_preparacion
                  ? 'Preparación'
                  : 'Nota'}
            </span>
          )}
        </div>
        <button
          type='button'
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Contraer' : 'Expandir'} edición de ${line.producto.producto_catalogo.nombre}`}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/30'
        >
          {isExpanded
            ? <LuChevronUp aria-hidden='true' className='h-4 w-4' />
            : <LuChevronDown aria-hidden='true' className='h-4 w-4' />}
        </button>
      </div>

      <div
        aria-hidden={!isExpanded}
        inert={!isExpanded}
        className={`grid min-w-0 grid-cols-1 overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 ease-out sm:grid-cols-2 ${isExpanded ? 'mt-3 grid-rows-[1fr] gap-3 opacity-100' : 'mt-0 grid-rows-[0fr] gap-0 opacity-0'}`}
      >
        <div className='min-h-0 min-w-0 overflow-hidden'>
          <div className='grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2'>
            <label className='min-w-0 text-xs font-semibold text-stone-600'>
          Preparación
              <select
                value={line.id_tipo_preparacion ?? ''}
                onChange={(event) => selectPreparation(event.target.value)}
                disabled={!preparationOptionsAvailable}
                className='mt-1 block min-h-10 w-full min-w-0 rounded-lg border border-stone-200 bg-stone-50 px-2.5 text-sm font-normal text-stone-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {line.id_tipo_preparacion && !preparations.some((item) => item.id === line.id_tipo_preparacion) && (
                  <option value={line.id_tipo_preparacion}>
                    {line.nombre_preparacion ?? 'Preparación seleccionada'}
                  </option>
                )}
                <option value=''>Sin preparación</option>
                {preparations.map((preparation) => (
                  <option key={preparation.id} value={preparation.id}>
                    {preparation.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className='min-w-0 text-xs font-semibold text-stone-600'>
          Cantidad ({line.producto.unidad_venta.abreviatura || line.producto.unidad_venta.nombre})
              <div className='mt-1 flex min-w-0 items-center gap-1'>
                <button
                  type='button'
                  aria-label='Disminuir cantidad'
                  disabled={line.cantidad <= step}
                  onClick={() => changeByStep(-step)}
                  className='flex h-10 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <LuMinus aria-hidden='true' className='h-3.5 w-3.5' />
                </button>
                <input
                  type='number'
                  inputMode='decimal'
                  min='0'
                  max='300'
                  step={step === 0.25 ? 'any' : '1'}
                  value={quantityInput}
                  onChange={(event) =>
                    setQuantityDraft({ base: line.cantidad, value: event.target.value })
                  }
                  onBlur={(event) => {
                    if (
                      event.relatedTarget instanceof Element &&
                  event.relatedTarget.closest('[data-cart-remove]')
                    ) {
                      setQuantityDraft(null)
                      return
                    }
                    commitQuantity()
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur()
                  }}
                  aria-label={`Cantidad de ${line.producto.producto_catalogo.nombre}`}
                  className='h-10 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-1 text-center text-sm font-semibold text-stone-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
                />
                <button
                  type='button'
                  aria-label='Aumentar cantidad'
                  disabled={line.cantidad >= 300}
                  onClick={() => changeByStep(step)}
                  className='flex h-10 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <LuPlus aria-hidden='true' className='h-3.5 w-3.5' />
                </button>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className={`grid min-w-0 overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${isExpanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`} aria-hidden={!isExpanded} inert={!isExpanded}>
        <label className='min-h-0 block overflow-hidden text-xs font-semibold text-stone-600'>
        Observaciones
          <textarea
            value={observationsInput}
            maxLength={255}
            rows={2}
            onChange={(event) =>
              setObservationsDraft({
                base: line.observaciones,
                value: event.target.value
              })
            }
            onBlur={(event) => {
              if (
                event.relatedTarget instanceof Element &&
              event.relatedTarget.closest('[data-cart-remove]')
              ) {
                setObservationsDraft(null)
                return
              }
              onObservationsChange(line.lineId, observationsInput.trim() || null)
              setObservationsDraft(null)
            }}
            className='mt-1 block w-full min-w-0 resize-y rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-2 text-sm font-normal text-stone-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'
          />
          <span className='mt-1 block text-right font-normal text-stone-400'>
            {observationsInput.length}/255
          </span>
        </label>
      </div>

      <div className={`grid min-w-0 overflow-hidden transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${isExpanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`} aria-hidden={!isExpanded} inert={!isExpanded}>
        <div className='min-h-0 flex items-center justify-between gap-3 overflow-hidden border-t border-stone-100 pt-3'>
          <span className='text-xs text-stone-500'>Subtotal</span>
          <span className='text-sm font-bold text-primary'>
            {formatCurrency(line.subtotal)}
          </span>
        </div>
      </div>
    </article>
  )
}
