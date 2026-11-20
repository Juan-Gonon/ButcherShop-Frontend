import { useState } from 'react'
import Swal from 'sweetalert2'
import { FiAlertCircle, FiCheck, FiClock, FiCornerUpLeft, FiLoader, FiShoppingBag } from 'react-icons/fi'
import type { FinishPreparationResult } from '../hooks/useFinishPreparation'
import type { ReturnToCounterResult } from '../hooks/useReturnToCounter'
import type { KdsPreparingOrder } from '../types/kds'

interface PreparingOrderCardProps {
  order: KdsPreparingOrder
  checkedDetailIds: ReadonlySet<string>
  progress: {
    total: number
    completed: number
    percentage: number
  }
  onToggleDetail: (detailId: string) => void
  finishLoading: boolean
  transitionError: string | null
  refreshError: string | null
  transitionSucceeded: boolean
  onFinishPreparation: () => Promise<FinishPreparationResult | null>
  returnLoading: boolean
  returnSucceeded: boolean
  returnTransitionError: string | null
  returnRefreshError: string | null
  onReturnToCounter: () => Promise<ReturnToCounterResult>
}

const businessDateTime = new Intl.DateTimeFormat('es-GT', {
  timeZone: 'America/Guatemala',
  dateStyle: 'medium',
  timeStyle: 'short'
})

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : businessDateTime.format(date)
}

export const PreparingOrderCard = ({
  order,
  checkedDetailIds,
  progress,
  onToggleDetail,
  finishLoading,
  transitionError,
  refreshError,
  transitionSucceeded,
  onFinishPreparation,
  returnLoading,
  returnSucceeded,
  returnTransitionError,
  returnRefreshError,
  onReturnToCounter
}: PreparingOrderCardProps) => {
  const [returnConfirmationOpen, setReturnConfirmationOpen] = useState(false)
  const checklistComplete = progress.total > 0 && progress.completed === progress.total
  const conflictDetected = transitionError?.includes('cambió de estado') ?? false
  const finishLabel = order.tipo_entrega === 'Recoger en tienda'
    ? 'Finalizar y entregar'
    : 'Enviar a reparto'
  const finishButtonLabel = finishLoading
    ? (transitionSucceeded ? 'Actualizando lista…' : 'Finalizando…')
    : finishLabel

  const handleFinishPreparation = () => {
    if (!checklistComplete || finishLoading || transitionSucceeded || returnLoading || returnSucceeded) return
    void onFinishPreparation()
  }

  const handleReturnToCounter = async () => {
    if (returnConfirmationOpen || returnLoading || returnSucceeded || finishLoading || transitionSucceeded) return

    setReturnConfirmationOpen(true)
    try {
      const confirmation = await Swal.fire({
        icon: 'question',
        title: 'Devolver pedido a mostrador',
        text: `El pedido #${order.id_pedido} regresará a Confirmado y podrá editarse nuevamente desde mostrador.`,
        showCancelButton: true,
        confirmButtonText: 'Devolver a mostrador',
        cancelButtonText: 'Seguir preparando',
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
        customClass: {
          popup: 'rounded-2xl border border-stone-100 bg-white shadow-2xl',
          title: 'text-xl font-semibold text-neutral',
          htmlContainer: 'text-sm leading-6 text-stone-600',
          actions: 'gap-2',
          confirmButton: 'rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/30',
          cancelButton: 'rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300'
        }
      })

      if (confirmation.isConfirmed) await onReturnToCounter()
    } finally {
      setReturnConfirmationOpen(false)
    }
  }

  return (
    <article className='flex min-w-0 flex-col gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm sm:p-5'>
      <div className='flex min-w-0 flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='font-label text-lg font-bold text-primary'>#{order.id_pedido}</p>
          <h3 className='mt-1 break-words text-base font-semibold text-neutral sm:text-lg'>
            {order.cliente.nombre}
          </h3>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary'>
            {order.tipo_entrega}
          </span>
          <p className='inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#f6ece3] px-2.5 py-1.5 text-xs text-neutral/80'>
            <FiClock aria-hidden='true' />
            <time dateTime={order.fecha}>{formatDateTime(order.fecha)}</time>
          </p>
        </div>
      </div>

      <section aria-label={`Checklist de preparación del pedido ${order.id_pedido}`} className='space-y-2'>
        <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm font-semibold text-neutral'>
          <p aria-live='polite'>
            {progress.completed} de {progress.total} detalles preparados — {progress.percentage} %
          </p>
          {progress.total > 0 && progress.completed === progress.total && (
            <p className='text-secondary' role='status'>Checklist completado</p>
          )}
        </div>
        <div
          aria-label={`Progreso del checklist del pedido ${order.id_pedido}`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress.percentage}
          className='h-2 overflow-hidden rounded-full bg-[#eadbcd]'
          role='progressbar'
        >
          <div
            className='h-full rounded-full bg-secondary transition-[width] duration-200'
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <p className='text-xs text-neutral/70'>El checklist es visual y no modifica el estado ni confirma la entrega.</p>
      </section>

      <div className='rounded-xl bg-[#fbf2e9] p-3'>
        <p className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral/70'>
          <FiShoppingBag aria-hidden='true' className='text-secondary' />
        Productos ({order.detalles.length})
        </p>
        {order.detalles.length > 0 ? (
          <ul className='mt-2.5 space-y-3'>
            {order.detalles.map((detail, index) => (
              <li className='min-w-0 border-t border-[#eadbcd] pt-2.5 first:border-0 first:pt-0' key={detail.id_detalle_pedido}>
                <label className='flex min-h-12 min-w-0 cursor-pointer items-start gap-3 rounded-lg p-2 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary'>
                  <input
                    aria-label={`Preparado: detalle ${index + 1}, ${detail.cantidad} ${detail.unidad} ${detail.producto}`}
                    checked={checkedDetailIds.has(detail.id_detalle_pedido)}
                    className='mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                    disabled={returnLoading || returnSucceeded}
                    onChange={() => onToggleDetail(detail.id_detalle_pedido)}
                    type='checkbox'
                  />
                  <span className='min-w-0 flex-1'>
                    <span className='block break-words text-sm font-semibold text-neutral'>
                      <span className='tabular-nums'>{detail.cantidad} {detail.unidad}</span>{' '}
                      {detail.producto}
                    </span>
                    {detail.preparacion?.trim() && (
                      <span className='mt-1 block break-words text-sm text-primary'>Preparación: {detail.preparacion}</span>
                    )}
                    {detail.observaciones?.trim() && (
                      <span className='mt-1 block break-words text-sm text-neutral/75'>{detail.observaciones}</span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className='mt-2 text-sm text-neutral/70'>Sin productos registrados.</p>
        )}
      </div>

      <div className='space-y-2 border-t border-[#eadbcd] pt-3'>
        {!checklistComplete && (
          <p className='text-xs text-neutral/70' id={`finish-help-${order.uuid}`}>
            {progress.total === 0
              ? 'No se puede finalizar un pedido sin detalles.'
              : 'Marca todos los detalles como preparados para habilitar esta acción.'}
          </p>
        )}
        <button
          aria-describedby={!checklistComplete ? `finish-help-${order.uuid}` : undefined}
          className='inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-neutral/30 disabled:text-neutral/65 disabled:shadow-none sm:w-auto'
          disabled={!checklistComplete || finishLoading || transitionSucceeded || returnLoading || returnSucceeded}
          onClick={handleFinishPreparation}
          type='button'
        >
          {finishLoading
            ? <FiLoader aria-hidden='true' className='animate-spin' />
            : <FiCheck aria-hidden='true' />}
          {finishButtonLabel}
        </button>

        {finishLoading && (
          <p aria-live='polite' className='text-sm text-neutral/75' role='status'>
            {transitionSucceeded ? 'Pedido finalizado. Actualizando la lista…' : 'Procesando la finalización…'}
          </p>
        )}

        {transitionSucceeded && refreshError && (
          <p className='flex items-start gap-2 text-sm font-medium text-primary' role='alert'>
            <FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />
            <span>{refreshError}</span>
          </p>
        )}

        {transitionSucceeded && !refreshError && !finishLoading && (
          <p className='text-sm font-semibold text-secondary' role='status'>
          Pedido finalizado correctamente.
          </p>
        )}

        {!transitionSucceeded && transitionError && (
          <p className='flex items-start gap-2 text-sm font-medium text-primary' role='alert'>
            <FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />
            <span>
              {transitionError}
              {conflictDetected && ' Verifica la información actualizada antes de volver a intentarlo.'}
            </span>
          </p>
        )}

        {!transitionSucceeded && refreshError && (
          <p className='flex items-start gap-2 text-sm font-medium text-primary' role='alert'>
            <FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />
            <span>{refreshError}</span>
          </p>
        )}
      </div>

      <div className='space-y-2 border-t border-[#eadbcd] pt-3'>
        <button
          className='inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto'
          disabled={returnLoading || returnConfirmationOpen || finishLoading || transitionSucceeded || returnSucceeded}
          onClick={() => { void handleReturnToCounter() }}
          type='button'
        >
          {returnLoading
            ? <FiLoader aria-hidden='true' className='animate-spin' />
            : <FiCornerUpLeft aria-hidden='true' />}
          {returnLoading
            ? (returnSucceeded ? 'Actualizando listas…' : 'Devolviendo a mostrador…')
            : returnConfirmationOpen ? 'Confirmando…' : 'Devolver a mostrador'}
        </button>

        {returnLoading && (
          <p aria-live='polite' className='text-sm text-neutral/75' role='status'>
            {returnSucceeded
              ? 'Pedido devuelto a Confirmado. Actualizando ambas listas…'
              : 'Procesando devolución a mostrador…'}
          </p>
        )}

        {returnSucceeded && returnRefreshError && (
          <p className='flex items-start gap-2 text-sm font-medium text-primary' role='alert'>
            <FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />
            <span>{returnRefreshError}</span>
          </p>
        )}

        {returnSucceeded && !returnRefreshError && !returnLoading && (
          <p className='text-sm font-semibold text-secondary' role='status'>
            Pedido devuelto a Confirmado. Mostrador puede editarlo nuevamente.
          </p>
        )}

        {!returnSucceeded && returnTransitionError && (
          <p className='flex items-start gap-2 text-sm font-medium text-primary' role='alert'>
            <FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />
            <span>{returnTransitionError}</span>
          </p>
        )}

        {!returnSucceeded && returnRefreshError && (
          <p className='flex items-start gap-2 text-sm font-medium text-primary' role='alert'>
            <FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />
            <span>{returnRefreshError}</span>
          </p>
        )}
      </div>
    </article>
  )
}
