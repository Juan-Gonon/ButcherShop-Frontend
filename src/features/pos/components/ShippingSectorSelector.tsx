import { LuMapPin } from 'react-icons/lu'
import { Button } from '../../../components/ui/Button'
import { Badge } from '../../../components/ui/Badge'
import type {
  ShippingSector,
  ShippingSectorSelection
} from '../types/shippingSector'

interface ShippingSectorSelectorProps {
  sectors: ShippingSector[] | null
  selectedSector: ShippingSectorSelection
  status: 'loading' | 'error' | 'empty' | 'success' | 'forbidden'
  error: string | null
  selectionError: string | null
  onSelect: (sector: ShippingSectorSelection) => void
  onRetry: () => void
}

export const ShippingSectorSelector = ({
  sectors,
  selectedSector,
  status,
  error,
  selectionError,
  onSelect,
  onRetry
}: ShippingSectorSelectorProps) => {
  const selectSector = (sectorId: string) => {
    const sector = sectors?.find((item) => item.id === sectorId) ?? null
    onSelect(sector)
  }

  return (
    <section
      aria-labelledby='shipping-sector-title'
      aria-live='polite'
      className='h-full rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_4px_20px_-2px_rgba(92,77,60,0.06)] backdrop-blur-sm'
    >
      <div className='flex items-start gap-2.5'>
        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
          <LuMapPin aria-hidden='true' className='h-5 w-5' />
        </span>
        <div className='min-w-0 flex-1'>
          <h2 id='shipping-sector-title' className='text-sm font-semibold text-neutral'>
            Sector de envío
          </h2>
          <p className='mt-1 text-sm text-neutral'>
            Sectores disponibles para entrega a domicilio.
          </p>

          {status === 'loading' && (
            <p className='mt-3 text-sm text-neutral' role='status'>
              Cargando sectores de envío…
            </p>
          )}
          {status === 'forbidden' && (
            <p className='mt-3 text-sm text-amber-800' role='alert'>
              {error}
            </p>
          )}
          {status === 'error' && (
            <div className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
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
          {status === 'empty' && (
            <p className='mt-3 text-sm text-neutral' role='status'>
              No hay sectores de envío disponibles.
            </p>
          )}
          {status === 'success' && sectors && (
            <div className='mt-3 space-y-3'>
              <label
                htmlFor='shipping-sector'
                className='block text-xs font-semibold uppercase tracking-wider text-stone-700'
              >
                Seleccionar sector
              </label>
              <select
                id='shipping-sector'
                value={selectedSector?.id ?? ''}
                onChange={(event) => selectSector(event.target.value)}
                className='block w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20'
              >
                <option value=''>Selecciona un sector de envío</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.nombre_sector} · Costo de envío: {sector.costo_envio}
                  </option>
                ))}
              </select>

              {selectionError && (
                <p className='text-sm text-amber-800' role='alert'>
                  {selectionError}
                </p>
              )}

              {selectedSector && (
                <div className='flex flex-col gap-2 rounded-xl border border-secondary/20 bg-secondary/5 p-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold text-neutral'>
                      {selectedSector.nombre_sector}
                    </p>
                    <p className='mt-0.5 text-sm text-neutral'>
                      Costo de envío: {selectedSector.costo_envio}
                    </p>
                  </div>
                  <Badge dotColor='bg-secondary' className='w-fit text-secondary'>
                    Sector seleccionado
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
