import { useCallback, useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { FiAlertCircle, FiClipboard, FiRefreshCw } from 'react-icons/fi'
import { useFinishPreparation } from '../hooks/useFinishPreparation'
import { useKdsOrders } from '../hooks/useKdsOrders'
import { useReturnToCounter } from '../hooks/useReturnToCounter'
import type { FinishPreparationState } from '../hooks/useFinishPreparation'
import type { KdsPreparingOrder } from '../types/kds'
import type { ReturnToCounterState } from '../hooks/useReturnToCounter'
import { PreparingOrderCard } from './PreparingOrderCard'

const PAGE_SIZE = 20

interface OrderChecklistProgress {
  total: number
  completed: number
  percentage: number
}

type ChecklistByOrder = Record<string, ReadonlySet<string>>

interface PreparingOrdersListProps {
  refreshKey: number
  refreshConfirmedOrders: () => Promise<void>
  onPollingReady: (poll: (() => boolean) | null) => void
  onOrdersObserved: (uuids: string[]) => void
}

export const PreparingOrdersList = ({
  refreshKey,
  refreshConfirmedOrders,
  onPollingReady,
  onOrdersObserved
}: PreparingOrdersListProps) => {
  const [page, setPage] = useState(1)
  const [checklistByOrder, setChecklistByOrder] = useState<ChecklistByOrder>({})
  const correctPage = useCallback((validPage: number) => setPage(validPage), [])
  const { orders, pagination, loading, error, refetch, pollIfIdle } = useKdsOrders(
    'En preparación',
    PAGE_SIZE,
    page,
    refreshKey,
    correctPage
  )
  const {
    finishPreparation,
    stateByOrder,
    clearOrderState: clearFinishState
  } = useFinishPreparation()
  const {
    returnToCounter,
    stateByOrder: returnStateByOrder,
    clearOrderState: clearReturnState
  } = useReturnToCounter()

  useEffect(() => {
    onPollingReady(pollIfIdle)
    return () => onPollingReady(null)
  }, [onPollingReady, pollIfIdle])

  useEffect(() => {
    onOrdersObserved(orders.map((order) => order.uuid))
  }, [onOrdersObserved, orders])

  const toggleDetail = useCallback((orderUuid: string, detailId: string) => {
    setChecklistByOrder((current) => {
      const completedIds = new Set(current[orderUuid] ?? [])
      if (completedIds.has(detailId)) completedIds.delete(detailId)
      else completedIds.add(detailId)

      return { ...current, [orderUuid]: completedIds }
    })
  }, [])

  const refreshBothLists = useCallback(async () => {
    const [confirmedResult, preparingResult] = await Promise.allSettled([
      refreshConfirmedOrders(),
      refetch()
    ])
    const failedLists: string[] = []
    if (confirmedResult.status === 'rejected') failedLists.push('Confirmados')
    if (preparingResult.status === 'rejected') failedLists.push('En preparación')

    if (failedLists.length > 0) {
      throw new Error(`No se pudo actualizar la lista: ${failedLists.join(' y ')}.`)
    }
  }, [refreshConfirmedOrders, refetch])

  const clearChecklist = useCallback((orderUuid: string) => {
    setChecklistByOrder((current) => {
      if (!(orderUuid in current)) return current
      const next = { ...current }
      delete next[orderUuid]
      return next
    })
  }, [])

  const handleReturnToCounter = useCallback(async (order: KdsPreparingOrder) => {
    const result = await returnToCounter(order, refreshBothLists, () => {
      clearChecklist(order.uuid)
      clearFinishState(order.uuid)
      void Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Pedido #${order.id_pedido} devuelto a Confirmado`,
        text: 'Actualizando ambas listas…',
        showConfirmButton: false,
        showCloseButton: true,
        timer: 4000,
        timerProgressBar: true
      })
    })

    if (result.status === 'returned-refresh-failed') {
      void Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Pedido devuelto; falta actualizar las listas',
        text: result.error,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 6000,
        timerProgressBar: true
      })
    } else if (result.status === 'transition-failed') {
      const message = result.refreshError
        ? `${result.error} ${result.refreshError}`
        : result.error
      void Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'No se pudo devolver el pedido',
        text: message,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 6000,
        timerProgressBar: true
      })
    }

    return result
  },
  [clearChecklist, clearFinishState, refreshBothLists, returnToCounter])

  useEffect(() => {
    const visibleOrderUuids = new Set(orders.map((order) => order.uuid))

    for (const [orderUuid, orderState] of stateByOrder) {
      if (!visibleOrderUuids.has(orderUuid) && !orderState.loading) clearFinishState(orderUuid)
    }

    for (const [orderUuid, orderState] of returnStateByOrder) {
      if (!visibleOrderUuids.has(orderUuid) && !orderState.loading) clearReturnState(orderUuid)
    }
  }, [clearFinishState, clearReturnState, orders, returnStateByOrder, stateByOrder])

  return (
    <section aria-labelledby='preparing-orders-title' className='min-w-0'>
      <header className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <h2 className='text-lg font-semibold tracking-tight text-neutral sm:text-xl' id='preparing-orders-title'>
            En mesa de corte
          </h2>
          {pagination && (
            <span className='inline-flex min-w-7 items-center justify-center rounded-full bg-[#ffdec2] px-2 py-1 text-sm font-bold text-[#4d2a00]'>
              {pagination.total}
            </span>
          )}
        </div>
        {pagination && pagination.totalPages > 1 && (
          <p className='text-xs text-neutral/70'>Página {pagination.page} de {pagination.totalPages}</p>
        )}
      </header>

      {loading && orders.length === 0 && (
        <div aria-label='Cargando pedidos en preparación' aria-live='polite' className='space-y-3'>
          {[0, 1].map((item) => (
            <div className='animate-pulse rounded-2xl border border-white/80 bg-white/90 p-4' key={item}>
              <div className='h-5 w-32 rounded bg-[#eadbcd]' />
              <div className='mt-4 h-20 rounded-xl bg-[#fbf2e9]' />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className='mb-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4' role='alert'>
          <p className='flex items-start gap-2 text-sm font-medium text-primary'>
            <FiAlertCircle aria-hidden='true' className='mt-0.5 shrink-0' />
            <span>
              {error}
              {orders.length > 0 && pagination && (
                <span className='font-normal'> Se conservan los resultados de la página {pagination.page}.</span>
              )}
            </span>
          </p>
          <button
            className='mt-3 inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0'
            disabled={loading}
            onClick={refetch}
            type='button'
          >
            <FiRefreshCw aria-hidden='true' />
            Volver a consultar
          </button>
        </div>
      )}

      {loading && orders.length > 0 && (
        <p aria-live='polite' className='mb-3 text-sm text-neutral/70' role='status'>Actualizando pedidos en preparación…</p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className='flex min-h-40 flex-col items-center justify-center rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-6 text-center'>
          <FiClipboard aria-hidden='true' className='text-2xl text-secondary' />
          <p className='mt-3 font-semibold text-neutral'>No hay pedidos en preparación</p>
          <p className='mt-1 text-sm text-neutral/80'>Los pedidos aparecerán aquí cuando comiencen a prepararse.</p>
        </div>
      )}

      {orders.length > 0 && (
        <div aria-busy={loading} aria-live='polite' className='space-y-3'>
          {orders.map((order) => {
            const completedDetailIds = new Set(
              order.detalles
                .filter((detail) => checklistByOrder[order.uuid]?.has(detail.id_detalle_pedido))
                .map((detail) => detail.id_detalle_pedido)
            )
            const total = order.detalles.length
            const completed = completedDetailIds.size
            const progress: OrderChecklistProgress = {
              total,
              completed,
              percentage: total === 0 ? 0 : Math.round((completed / total) * 100)
            }
            const finishState: FinishPreparationState | undefined = stateByOrder.get(order.uuid)
            const returnState: ReturnToCounterState | undefined = returnStateByOrder.get(order.uuid)

            return (
              <PreparingOrderCard
                key={order.uuid}
                checkedDetailIds={completedDetailIds}
                finishLoading={finishState?.loading ?? false}
                onFinishPreparation={() => (
                  total > 0 && completed === total
                    ? finishPreparation(order, refetch)
                    : Promise.resolve(null)
                )}
                onToggleDetail={(detailId) => toggleDetail(order.uuid, detailId)}
                order={order}
                progress={progress}
                returnLoading={returnState?.loading ?? false}
                returnSucceeded={returnState?.transitionSucceeded ?? false}
                returnTransitionError={returnState?.transitionError ?? null}
                returnRefreshError={returnState?.refreshError ?? null}
                onReturnToCounter={() => handleReturnToCounter(order)}
                refreshError={finishState?.refreshError ?? null}
                transitionError={finishState?.transitionError ?? null}
                transitionSucceeded={finishState?.transitionSucceeded ?? false}
              />
            )
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <nav aria-label='Paginación de pedidos en preparación' className='mt-4 flex items-center justify-between gap-3'>
          <button
            className='min-h-10 rounded-xl border border-[#eadbcd] bg-white px-4 text-sm font-semibold text-neutral transition hover:bg-[#fbf2e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'
            disabled={loading || page <= 1}
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            type='button'
          >
            Anterior
          </button>
          <span className='font-label text-xs tabular-nums text-neutral/75'>
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            className='min-h-10 rounded-xl border border-[#eadbcd] bg-white px-4 text-sm font-semibold text-neutral transition hover:bg-[#fbf2e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'
            disabled={loading || page >= pagination.totalPages}
            onClick={() => setPage((currentPage) => Math.min(currentPage + 1, pagination.totalPages))}
            type='button'
          >
            Siguiente
          </button>
        </nav>
      )}
    </section>
  )
}
