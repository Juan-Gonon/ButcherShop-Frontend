import { useState } from 'react'
import { LuClipboardList } from 'react-icons/lu'
import { ConfirmedOrdersList } from './components/ConfirmedOrdersList'
import { PreparingOrdersList } from './components/PreparingOrdersList'

export const KdsPage = () => {
  const [preparingRefreshKey, setPreparingRefreshKey] = useState(0)

  return (
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
            <ConfirmedOrdersList onPreparationStarted={() => setPreparingRefreshKey((key) => key + 1)} />
          </div>
          <div className='min-w-0 rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm sm:p-5 xl:col-span-7'>
            <PreparingOrdersList refreshKey={preparingRefreshKey} />
          </div>
        </div>
      </div>
    </div>
  )
}