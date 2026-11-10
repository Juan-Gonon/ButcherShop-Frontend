import type { DeliveryMode } from '../types/delivery'

interface DeliveryModeSelectorProps {
  mode: DeliveryMode
  onChange: (mode: DeliveryMode) => void
}

export const DeliveryModeSelector = ({ mode, onChange }: DeliveryModeSelectorProps) => (
  <section
    aria-labelledby='delivery-mode-title'
    className='rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_4px_20px_-2px_rgba(92,77,60,0.06)] backdrop-blur-sm'
  >
    <fieldset>
      <legend id='delivery-mode-title' className='text-sm font-semibold text-neutral'>
        Modalidad de entrega
      </legend>
      <div className='mt-3 grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1'>
        <label className='cursor-pointer'>
          <input
            type='radio'
            name='delivery-mode'
            value='storePickup'
            checked={mode === 'storePickup'}
            onChange={() => onChange('storePickup')}
            className='peer sr-only'
          />
          <span className='flex min-h-10 items-center justify-center rounded-lg px-2 py-2 text-center text-xs font-semibold text-stone-600 transition peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 sm:text-sm'>
            Recoger en tienda
          </span>
        </label>
        <label className='cursor-pointer'>
          <input
            type='radio'
            name='delivery-mode'
            value='homeDelivery'
            checked={mode === 'homeDelivery'}
            onChange={() => onChange('homeDelivery')}
            className='peer sr-only'
          />
          <span className='flex min-h-10 items-center justify-center rounded-lg px-2 py-2 text-center text-xs font-semibold text-stone-600 transition peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 sm:text-sm'>
            A domicilio
          </span>
        </label>
      </div>
    </fieldset>
  </section>
)
