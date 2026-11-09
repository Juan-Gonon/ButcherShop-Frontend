import type { ReactNode } from 'react'
import { LuUserRound } from 'react-icons/lu'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import type { ConsumerFinal } from '../types/consumerFinal'

type SelectedClient = Pick<
  ConsumerFinal,
  'id' | 'uuid' | 'nombre' | 'telefono' | 'es_generico'
> & { direccion_defecto: string | null }

interface ConsumerFinalCardProps {
  consumerFinal: ConsumerFinal | null
  selectedClient: SelectedClient | null
  isConsumerFinalSelected: boolean
  canSearchClients: boolean
  onSearchToggle: () => void
  onSelectConsumerFinal: () => void
  searchOpen: boolean
  searchPanel: ReactNode
  status: 'loading' | 'error' | 'success'
  error: string | null
  onRetry: () => void
}

export const ConsumerFinalCard = ({
  consumerFinal,
  selectedClient,
  isConsumerFinalSelected,
  canSearchClients,
  onSearchToggle,
  onSelectConsumerFinal,
  searchOpen,
  searchPanel,
  status,
  error,
  onRetry
}: ConsumerFinalCardProps) => (
  <section
    aria-labelledby='pos-customer-title'
    aria-live='polite'
    className='rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_4px_20px_-2px_rgba(92,77,60,0.06)] backdrop-blur-sm sm:p-5'
  >
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex min-w-0 items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
          <LuUserRound aria-hidden='true' className='h-5 w-5' />
        </div>
        <div className='min-w-0'>
          <h2 id='pos-customer-title' className='text-sm font-medium text-neutral'>
            Cliente seleccionado
          </h2>
          {isConsumerFinalSelected && status === 'loading' && (
            <p className='mt-1 text-sm text-neutral' role='status'>
              Cargando Consumidor Final…
            </p>
          )}
          {isConsumerFinalSelected && status === 'error' && (
            <p className='mt-1 text-sm text-red-700' role='alert'>
              {error}
            </p>
          )}
          {selectedClient && (!isConsumerFinalSelected || status === 'success') && (
            <div className='mt-1 flex flex-wrap items-center gap-2'>
              <p className='truncate font-semibold text-neutral'>
                {selectedClient.nombre}
              </p>
              {isConsumerFinalSelected ? (
                <Badge dotColor='bg-secondary' className='text-secondary'>
                  Consumidor Final
                </Badge>
              ) : (
                <Badge dotColor='bg-primary' className='text-primary'>
                  Cliente seleccionado
                </Badge>
              )}
              {selectedClient.telefono && (
                <p className='w-full text-sm text-neutral'>
                  {selectedClient.telefono}
                </p>
              )}
              {selectedClient.direccion_defecto && (
                <p className='w-full text-sm text-neutral'>
                  {selectedClient.direccion_defecto}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className='flex flex-col gap-2 sm:items-end'>
        {status === 'error' && (
          <Button
            type='button'
            variant='outline'
            onClick={onRetry}
            className='w-full py-2.5 sm:w-auto'
          >
            Reintentar
          </Button>
        )}
        {canSearchClients && (
          <div className='flex flex-wrap gap-2 sm:justify-end'>
            {!isConsumerFinalSelected && consumerFinal && (
              <Button
                type='button'
                variant='outline'
                onClick={onSelectConsumerFinal}
                className='w-full py-2.5 sm:w-auto'
              >
                Volver a Consumidor Final
              </Button>
            )}
            <Button
              type='button'
              variant='secondary'
              onClick={onSearchToggle}
              aria-expanded={searchOpen}
              className='w-full py-2.5 sm:w-auto'
            >
              {searchOpen ? 'Cerrar búsqueda' : 'Buscar otro cliente'}
            </Button>
          </div>
        )}
      </div>
    </div>
    {searchOpen && canSearchClients && searchPanel}
  </section>
)
