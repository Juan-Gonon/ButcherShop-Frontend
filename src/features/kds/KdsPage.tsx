import { LuClipboardList, LuScissors } from 'react-icons/lu'
import { ConfirmedOrdersList } from './components/ConfirmedOrdersList'

export const KdsPage = () => (
  <div className='min-h-full bg-bg-light/40 p-2.5 sm:p-3.5 lg:p-4'>
    <div className='mx-auto flex w-full max-w-screen-2xl flex-col gap-4'>
      <header className='flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-[0_8px_30px_-10px_rgba(92,77,60,0.12)] backdrop-blur-sm sm:p-5'>
        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white'>
          <LuClipboardList aria-hidden='true' className='h-5 w-5' />
        </div>
        <div className='min-w-0'>
          <p className='font-label text-[11px] font-medium uppercase tracking-[0.12em] text-secondary'>
            KDS · Operación de carnicería
          </p>
          <h1 className='text-xl font-semibold tracking-tight text-neutral sm:text-2xl'>
            Mesa de preparación
          </h1>
          <p className='mt-1 text-sm text-neutral'>Pedidos confirmados y zona de trabajo.</p>
        </div>
      </header>

      <div className='grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-12'>
        <div className='min-w-0 xl:col-span-5'>
          <ConfirmedOrdersList />
        </div>

        <section
          aria-labelledby='kds-work-area-title'
          className='min-w-0 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm sm:p-5 xl:col-span-7'
        >
          <div className='flex items-center gap-3'>
            <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary'>
              <LuScissors aria-hidden='true' className='h-5 w-5' />
            </span>
            <div className='min-w-0'>
              <h2 className='text-lg font-semibold tracking-tight text-neutral' id='kds-work-area-title'>
                En mesa de corte
              </h2>
              <p className='mt-0.5 text-sm text-neutral/75'>Zona de trabajo</p>
            </div>
          </div>

          <div className='mt-4 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-[#eadbcd] bg-[#fbf2e9]/70 px-5 py-8 text-center sm:min-h-72'>
            <LuClipboardList aria-hidden='true' className='h-8 w-8 text-neutral/40' />
            <p className='mt-3 font-semibold text-neutral'>Aún no se muestran pedidos en preparación</p>
            <p className='mt-1 max-w-sm text-sm leading-6 text-neutral/75'>
              Esta vista consulta pedidos confirmados. La consulta de pedidos en preparación se integrará posteriormente.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
)
