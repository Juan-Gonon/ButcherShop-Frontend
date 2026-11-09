import { LuUserRound } from 'react-icons/lu'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import type { ConsumerFinal } from '../types/consumerFinal'

interface ConsumerFinalCardProps {
  consumerFinal: ConsumerFinal | null
  status: 'loading' | 'error' | 'success'
  error: string | null
  onRetry: () => void
}

export const ConsumerFinalCard = ({
  consumerFinal,
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
          {status === 'loading' && (
            <p className='mt-1 text-sm text-neutral' role='status'>
              Cargando Consumidor Final…
            </p>
          )}
          {status === 'error' && (
            <p className='mt-1 text-sm text-red-700' role='alert'>
              {error}
            </p>
          )}
          {status === 'success' && consumerFinal && (
            <div className='mt-1 flex flex-wrap items-center gap-2'>
              <p className='truncate font-semibold text-neutral'>
                {consumerFinal.nombre}
              </p>
              <Badge dotColor='bg-secondary' className='text-secondary'>
                Consumidor Final
              </Badge>
            </div>
          )}
        </div>
      </div>
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
    </div>
  </section>
)
