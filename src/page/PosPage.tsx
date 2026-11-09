import { useState } from 'react'
import { LuShoppingCart } from 'react-icons/lu'
import { USER_ROLES } from '../router/roles'
import { ConsumerFinalCard } from '../features/pos/components/ConsumerFinalCard'
import { ClientSearchPanel } from '../features/pos/components/ClientSearchPanel'
import { useClientSearch } from '../features/pos/hooks/useClientSearch'
import { useConsumerFinal } from '../features/pos/hooks/useConsumerFinal'
import type { ClientSearchResult } from '../features/pos/types/clientSearch'
import { useAuthStore } from '../store/hooks/useAuthStore'

export const PosPage = () => {
  const consumerFinalQuery = useConsumerFinal()
  const clientSearch = useClientSearch()
  const { user } = useAuthStore()
  const [selectedOtherClient, setSelectedOtherClient] =
    useState<ClientSearchResult | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  const isConsumerFinalSelected = selectedOtherClient === null
  const selectedClient = selectedOtherClient ?? consumerFinalQuery.data
  const canSearchClients =
    user?.id_rol === USER_ROLES.CARNICERIA_ADMIN ||
    user?.id_rol === USER_ROLES.OPERADOR

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
