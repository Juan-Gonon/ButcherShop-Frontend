import { useCallback, useRef, useState } from 'react'
import { USER_ROLES } from '../router/roles'
import { LuShoppingCart } from 'react-icons/lu'
import { ConsumerFinalCard } from '../features/pos/components/ConsumerFinalCard'
import { ClientSearchPanel } from '../features/pos/components/ClientSearchPanel'
import { DeliveryModeSelector } from '../features/pos/components/DeliveryModeSelector'
import { FloatingSectorPanel } from '../features/pos/components/FloatingSectorPanel'
import {
  ShippingSectorSelector,
  ShippingSectorSummary
} from '../features/pos/components/ShippingSectorSelector'
import { useClientSearch } from '../features/pos/hooks/useClientSearch'
import { useConsumerFinal } from '../features/pos/hooks/useConsumerFinal'
import { useShippingAddresses } from '../features/pos/hooks/useShippingAddresses'
import type { ClientSearchResult } from '../features/pos/types/clientSearch'
import type { DeliveryMode } from '../features/pos/types/delivery'
import type { ShippingSectorSelection } from '../features/pos/types/shippingSector'
import { buildDeliveryPayload } from '../features/pos/utils/buildDeliveryPayload'
import { useAuthStore } from '../store/hooks/useAuthStore'

export const PosPage = () => {
  const consumerFinalQuery = useConsumerFinal()
  const clientSearch = useClientSearch()
  const { user } = useAuthStore()
  const [selectedOtherClient, setSelectedOtherClient] =
    useState<ClientSearchResult | null>(null)
  const [selectedShippingSector, setSelectedShippingSector] =
    useState<ShippingSectorSelection>(null)
  const [deliveryMode, setDeliveryMode] =
    useState<DeliveryMode>('storePickup')
  const [sectorSelectorOpen, setSectorSelectorOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const deliveryModeAnchorRef = useRef<HTMLDivElement | null>(null)

  const isConsumerFinalSelected = selectedOtherClient === null
  const selectedClient = selectedOtherClient ?? consumerFinalQuery.data
  const canSearchClients =
    user?.id_rol === USER_ROLES.CARNICERIA_ADMIN ||
    user?.id_rol === USER_ROLES.OPERADOR
  const canLoadShippingSectors = canSearchClients
  const shippingSectors = useShippingAddresses(canLoadShippingSectors)
  const deliveryPayload = buildDeliveryPayload(
    deliveryMode,
    selectedShippingSector
  )

  const changeDeliveryMode = (mode: DeliveryMode) => {
    setDeliveryMode(mode)
    if (mode === 'storePickup') {
      setSelectedShippingSector(null)
      setSectorSelectorOpen(false)
    } else if (!selectedShippingSector) {
      setSectorSelectorOpen(true)
    }
  }

  const closeSectorSelector = useCallback(() => {
    setSectorSelectorOpen(false)
  }, [])

  const selectShippingSector = (sector: ShippingSectorSelection) => {
    setSelectedShippingSector(sector)
    setSectorSelectorOpen(false)
  }

  const getDeliveryValidationMessage = () => {
    if (deliveryPayload.valid) return null
    if (deliveryPayload.reason === 'sector-required') {
      return 'Selecciona un sector para completar la entrega a domicilio.'
    }
    return 'El identificador del sector de envío no es válido.'
  }

  const selectOtherClient = (client: ClientSearchResult) => {
    setSelectedOtherClient(client)
    setSearchOpen(false)
    clientSearch.setQuery('')
  }

  const selectConsumerFinal = () => {
    setSelectedOtherClient(null)
    setSearchOpen(false)
    clientSearch.setQuery('')
  }

  const toggleClientSearch = () => {
    if (searchOpen) {
      clientSearch.setQuery('')
    }
    setSearchOpen(!searchOpen)
  }

  return (
    <div className='min-h-full bg-bg-light/40 p-2.5 sm:p-3.5 lg:p-4'>
      <div className='mx-auto flex w-full max-w-screen-2xl flex-col gap-4'>
        <header className='flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_8px_30px_-10px_rgba(92,77,60,0.12)] backdrop-blur-sm sm:p-5'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white'>
            <LuShoppingCart aria-hidden='true' className='h-5 w-5' />
          </div>
          <div>
            <p className='font-label text-[11px] font-medium uppercase tracking-[0.12em] text-secondary'>
              El Corte de Oro
            </p>
            <h1 className='text-xl font-semibold tracking-tight text-neutral sm:text-2xl'>
              Punto de Venta
            </h1>
            <p className='mt-1 text-sm text-neutral'>
              Creación de pedidos desde mostrador
            </p>
          </div>
        </header>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start'>
          <div className='min-w-0 md:col-span-7'>
            <ConsumerFinalCard
              consumerFinal={consumerFinalQuery.data}
              selectedClient={selectedClient}
              isConsumerFinalSelected={isConsumerFinalSelected}
              canSearchClients={canSearchClients}
              onSearchToggle={toggleClientSearch}
              onSelectConsumerFinal={selectConsumerFinal}
              searchOpen={searchOpen}
              searchPanel={
                <ClientSearchPanel
                  query={clientSearch.query}
                  onQueryChange={clientSearch.setQuery}
                  clients={clientSearch.clients}
                  status={clientSearch.status}
                  error={clientSearch.error}
                  onRetry={clientSearch.retry}
                  onSelect={selectOtherClient}
                />
              }
              status={consumerFinalQuery.status}
              error={consumerFinalQuery.error}
              onRetry={consumerFinalQuery.retry}
            />
          </div>

          <div className='flex min-w-0 flex-col gap-4 md:col-span-5'>
            <div ref={deliveryModeAnchorRef} className='relative'>
              <DeliveryModeSelector
                mode={deliveryMode}
                onChange={changeDeliveryMode}
              />
            </div>
            {deliveryMode === 'homeDelivery' && selectedShippingSector && (
              <ShippingSectorSummary
                sector={selectedShippingSector}
                onChange={() => setSectorSelectorOpen(true)}
              />
            )}
            {deliveryMode === 'homeDelivery' && !selectedShippingSector && !sectorSelectorOpen && (
              <button
                type='button'
                onClick={() => setSectorSelectorOpen(true)}
                className='rounded-xl border border-dashed border-primary/30 bg-white/60 px-4 py-3 text-sm font-medium text-primary transition hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30'
              >
                Seleccionar sector de envío
              </button>
            )}
          </div>
        </div>

        {deliveryMode === 'homeDelivery' && sectorSelectorOpen && (
          <FloatingSectorPanel
            anchorRef={deliveryModeAnchorRef}
            onClose={closeSectorSelector}
          >
            <ShippingSectorSelector
              sectors={shippingSectors.data}
              selectedSector={selectedShippingSector}
              status={shippingSectors.status}
              error={shippingSectors.error}
              selectionError={getDeliveryValidationMessage()}
              onSelect={selectShippingSector}
              onRetry={shippingSectors.retry}
            />
          </FloatingSectorPanel>
        )}

        <section
          aria-label='Pedido actual'
          className='rounded-2xl border border-dashed border-neutral/25 bg-white/40 p-6 text-center text-sm text-neutral sm:p-8'
        >
          El pedido actual aparecerá aquí.
        </section>
      </div>
    </div>
  )
}
