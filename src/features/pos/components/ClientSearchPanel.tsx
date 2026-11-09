import { LuSearch, LuUserRound } from 'react-icons/lu'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import type { ClientSearchResult } from '../types/clientSearch'

interface ClientSearchPanelProps {
  query: string
  onQueryChange: (query: string) => void
  clients: ClientSearchResult[]
  status: 'idle' | 'waiting' | 'loading' | 'error' | 'empty' | 'success'
  error: string | null
  onRetry: () => void
  onSelect: (client: ClientSearchResult) => void
}

export const ClientSearchPanel = ({
  query,
  onQueryChange,
  clients,
  status,
  error,
  onRetry,
  onSelect
}: ClientSearchPanelProps) => (
  <div className='mt-4 border-t border-neutral/10 pt-4'>
    <Input
      id='pos-client-search'
      label='Buscar otro cliente'
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      placeholder='Escribe el nombre del cliente'
      autoComplete='off'
      icon={<LuSearch aria-hidden='true' className='h-4 w-4' />}
      aria-describedby='pos-client-search-status'
    />

    <div
      id='pos-client-search-status'
      className='mt-3'
      aria-live='polite'
      aria-busy={status === 'waiting' || status === 'loading'}
    >
      {status === 'idle' && (
        <p className='text-sm text-neutral'>Escribe para buscar clientes.</p>
      )}
      {status === 'waiting' && (
        <p className='text-sm text-neutral' role='status'>
          Esperando para buscar…
        </p>
      )}
      {status === 'loading' && (
        <p className='text-sm text-neutral' role='status'>
          Buscando clientes…
        </p>
      )}
      {status === 'empty' && (
        <p className='text-sm text-neutral' role='status'>
          No se encontraron clientes.
        </p>
      )}
      {status === 'error' && (
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-red-700' role='alert'>
            {error}
          </p>
          <Button
            type='button'
            variant='outline'
            onClick={onRetry}
            className='w-full py-2.5 sm:w-auto'
          >
            Reintentar
          </Button>
        </div>
      )}
      {status === 'success' && (
        <ul className='flex flex-col gap-2' aria-label='Resultados de clientes'>
          {clients.map((client) => (
            <li key={client.uuid}>
              <button
                type='button'
                onClick={() => onSelect(client)}
                className='flex w-full items-start gap-3 rounded-xl border border-neutral/10 bg-white p-3 text-left transition hover:border-primary/30 hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30'
              >
                <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <LuUserRound aria-hidden='true' className='h-4 w-4' />
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-sm font-semibold text-neutral'>
                    {client.nombre}
                  </span>
                  {client.telefono && (
                    <span className='mt-0.5 block text-sm text-neutral'>
                      {client.telefono}
                    </span>
                  )}
                  {client.direccion_defecto && (
                    <span className='mt-0.5 block truncate text-xs text-neutral'>
                      {client.direccion_defecto}
                    </span>
                  )}
                </span>
                <span className='shrink-0 self-center text-xs font-semibold text-primary'>
                  Seleccionar
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
)
