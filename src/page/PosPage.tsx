import { LuShoppingCart } from 'react-icons/lu'
import { ConsumerFinalCard } from '../features/pos/components/ConsumerFinalCard'
import { useConsumerFinal } from '../features/pos/hooks/useConsumerFinal'

export const PosPage = () => {
  const { data, status, error, retry } = useConsumerFinal()

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
          consumerFinal={data}
          status={status}
          error={error}
          onRetry={retry}
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
