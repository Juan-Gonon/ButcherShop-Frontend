import { useCallback, useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
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
import { usePreparations } from '../features/pos/hooks/usePreparations'
import { useProductCatalog } from '../features/pos/hooks/useProductCatalog'
import { useShippingAddresses } from '../features/pos/hooks/useShippingAddresses'
import type { ClientSearchResult } from '../features/pos/types/clientSearch'
import type { DeliveryMode } from '../features/pos/types/delivery'
import type { ConfiguredProduct } from '../features/pos/types/productConfiguration'
import type {
  ButcheryProduct,
  ProductCategoryFilter
} from '../features/pos/types/productCatalog'
import type { ShippingSectorSelection } from '../features/pos/types/shippingSector'
import { buildDeliveryPayload } from '../features/pos/utils/buildDeliveryPayload'
import { buildCreateOrderRequest } from '../features/pos/utils/buildCreateOrderRequest'
import { ProductCatalogToolbar } from '../features/pos/components/ProductCatalogToolbar'
import { ProductGrid } from '../features/pos/components/ProductGrid'
import { ProductConfigurationModal } from '../features/pos/components/ProductConfigurationModal'
import { CurrentOrderSummary } from '../features/pos/components/CurrentOrderSummary'
import { useCart } from '../features/pos/hooks/useCart'
import { useCreateOrder } from '../features/pos/hooks/useCreateOrder'
import { useAuthStore } from '../store/hooks/useAuthStore'
import type { Preparation } from '../features/pos/types/preparation'

const OrderToast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  showCloseButton: true,
  timer: 4500,
  timerProgressBar: true,
  customClass: {
    popup: 'rounded-2xl border border-red-100 bg-white shadow-xl',
    title: 'text-sm font-semibold text-stone-900',
    htmlContainer: 'text-sm text-stone-600'
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2
  }).format(value)

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
  const [productCategory, setProductCategory] =
    useState<ProductCategoryFilter>('all')
  const [productToConfigure, setProductToConfigure] =
    useState<ButcheryProduct | null>(null)
  const [productConfigurationSession, setProductConfigurationSession] =
    useState(0)
  const deliveryModeAnchorRef = useRef<HTMLDivElement | null>(null)
  const productCatalog = useProductCatalog()
  const cart = useCart()
  const clearCart = cart.clearCart
  const orderCreation = useCreateOrder()
  const preparations = usePreparations(
    productToConfigure !== null || cart.lineCount > 0,
    productConfigurationSession
  )

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
  const createOrderRequest = buildCreateOrderRequest({
    clienteUuid: selectedClient?.uuid,
    delivery: deliveryPayload,
    lines: cart.lines
  })
  const canCreateOrders =
    user?.id_rol === USER_ROLES.CARNICERIA_ADMIN ||
    user?.id_rol === USER_ROLES.OPERADOR
  const canSubmitOrder =
    canCreateOrders &&
    createOrderRequest.valid &&
    orderCreation.status !== 'submitting' &&
    orderCreation.status !== 'success' &&
    orderCreation.status !== 'uncertain'

  const clearedSuccessResponseRef = useRef<object | null>(null)
  const shownOrderErrorRef = useRef<object | null>(null)
  const confirmationDialogOpenRef = useRef(false)

  useEffect(() => {
    if (orderCreation.state.status !== 'success') return

    const { response } = orderCreation.state
    if (clearedSuccessResponseRef.current === response) return

    clearedSuccessResponseRef.current = response
    clearCart()
  }, [clearCart, orderCreation.state])

  useEffect(() => {
    if (orderCreation.state.status !== 'error') return

    const errorState = orderCreation.state
    if (shownOrderErrorRef.current === errorState) return

    shownOrderErrorRef.current = errorState
    void OrderToast.fire({
      icon: 'error',
      title: 'No se pudo crear el pedido',
      text: errorState.message
    })
  }, [orderCreation.state])

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

  const handleProductAdd = (product: ButcheryProduct) => {
    if (
      orderCreation.status === 'submitting' ||
      orderCreation.status === 'uncertain'
    ) {
      return
    }

    if (orderCreation.status === 'success' || orderCreation.status === 'error') {
      orderCreation.reset()
    }
    setProductToConfigure(product)
    setProductConfigurationSession((session) => session + 1)
  }

  const closeProductConfiguration = useCallback(() => {
    setProductToConfigure(null)
  }, [])

  const handleConfiguredProduct = (configuration: ConfiguredProduct) => {
    cart.addConfiguredProduct(configuration)
  }

  const handleConfirmOrder = async () => {
    if (
      !canCreateOrders ||
      !createOrderRequest.valid ||
      orderCreation.status === 'submitting' ||
      orderCreation.status === 'uncertain' ||
      orderCreation.status === 'success' ||
      confirmationDialogOpenRef.current
    ) {
      return
    }

    confirmationDialogOpenRef.current = true
    try {
      const deliveryDescription = deliveryMode === 'storePickup'
        ? 'Recoger en tienda'
        : `A domicilio${selectedShippingSector ? ` · ${selectedShippingSector.nombre_sector}` : ''}`
      const confirmation = await Swal.fire({
        icon: 'question',
        title: 'Confirmar pedido',
        text: `Cliente: ${selectedClient?.nombre ?? ''}. Entrega: ${deliveryDescription}. Total actual: ${formatCurrency(cart.total)}.`,
        showCancelButton: true,
        confirmButtonText: 'Enviar pedido',
        cancelButtonText: 'Seguir revisando',
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

      if (!confirmation.isConfirmed) return

      await orderCreation.submitOrder(createOrderRequest.request)
    } finally {
      confirmationDialogOpenRef.current = false
    }
  }

  const handleCancelDraft = () => {
    if (
      orderCreation.status === 'submitting' ||
      orderCreation.status === 'uncertain'
    ) {
      return
    }

    cart.clearCart()
    if (orderCreation.status === 'error') orderCreation.reset()
  }

  const handleCartPreparationChange = (
    lineId: string,
    preparation: Preparation | null
  ) => {
    cart.setLinePreparation({
      lineId,
      id_tipo_preparacion: preparation?.id ?? null,
      nombre_preparacion: preparation?.nombre ?? null
    })
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

        {productToConfigure && (
          <ProductConfigurationModal
            product={productToConfigure}
            preparations={preparations.data}
            preparationsStatus={preparations.status}
            preparationsError={preparations.error}
            onRetryPreparations={preparations.retry}
            onClose={closeProductConfiguration}
            onConfirm={handleConfiguredProduct}
          />
        )}

        <div className='grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12'>
          <section aria-labelledby='product-catalog-title' className='min-w-0 rounded-2xl border border-white/80 bg-[#fbf2e9]/70 p-3 sm:p-5 xl:col-span-8'>
            <div className='mb-4 flex items-center justify-between gap-3'>
              <h2 id='product-catalog-title' className='text-lg font-semibold tracking-tight text-neutral sm:text-xl'>
              Catálogo de productos
              </h2>
            </div>
            <div className='mb-4'>
              <ProductCatalogToolbar
                selectedCategory={productCategory}
                onCategoryChange={setProductCategory}
              />
            </div>
            <ProductGrid
              products={productCatalog.data}
              status={productCatalog.status}
              error={productCatalog.error}
              category={productCategory}
              onAdd={handleProductAdd}
              onRetry={productCatalog.retry}
            />
          </section>

          <div className='min-w-0 xl:col-span-4'>
            <CurrentOrderSummary
              summary={cart.summary}
              validationError={cart.validationError}
              createOrderState={orderCreation.state}
              canCreateOrder={canCreateOrders}
              canSubmitOrder={canSubmitOrder}
              submitValidationError={
                createOrderRequest.valid ? null : createOrderRequest.error
              }
              onConfirmOrder={handleConfirmOrder}
              preparations={preparations.data}
              preparationsStatus={preparations.status}
              onRetryPreparations={preparations.retry}
              onClearError={cart.clearCartError}
              onCancelOrder={handleCancelDraft}
              onQuantityChange={(lineId, cantidad) =>
                cart.setLineQuantity({ lineId, cantidad })
              }
              onPreparationChange={handleCartPreparationChange}
              onObservationsChange={(lineId, observaciones) =>
                cart.setLineObservations({ lineId, observaciones })
              }
              onRemoveLine={(lineId) => cart.removeCartLine({ lineId })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
