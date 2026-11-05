import { LuUserRound } from 'react-icons/lu'
import type { HeaderAction, HeaderInfo } from './types'

interface AppHeaderProps {
  info: HeaderInfo
  actions?: readonly HeaderAction[]
}

export const AppHeader = ({ info, actions = [] }: AppHeaderProps) => (
  <header
    aria-label='Encabezado de la aplicación'
    className='flex min-h-16 w-full min-w-0 items-center justify-between gap-4 border-b border-neutral/15 bg-bg-light/90 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6'
  >
    <div className='flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2'>
      <div className='min-w-0'>
        <h1 className='truncate text-sm font-semibold tracking-tight text-stone-900'>
          {info.title}
        </h1>
        {info.subtitle && (
          <p className='truncate text-xs text-neutral'>{info.subtitle}</p>
        )}
      </div>

      {info.contextItems && info.contextItems.length > 0 && (
        <ul aria-label='Información contextual' className='flex min-w-0 flex-wrap gap-2'>
          {info.contextItems.map((item, index) => {
            const Icon = item.icon

            return (
              <li
                key={`${item.label}-${index}`}
                className='inline-flex min-w-0 items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs text-stone-900'
              >
                {Icon && <Icon aria-hidden='true' className='h-4 w-4 shrink-0 text-secondary' />}
                <span className='shrink-0 font-medium text-neutral'>{item.label}</span>
                <span className='truncate font-semibold'>{item.value}</span>
              </li>
            )
          })}
        </ul>
      )}
    </div>

    <div className='flex min-w-0 flex-wrap items-center justify-end gap-2'>
      {actions.map((action) => {
        const Icon = action.icon
        const isPrimary = action.variant === 'primary'

        return (
          <button
            key={action.id}
            type='button'
            aria-label={action.ariaLabel ?? action.label}
            onClick={action.onClick}
            className={[
              'inline-flex max-w-48 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              isPrimary
                ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                : 'bg-white/70 text-neutral hover:bg-tertiary/50 hover:text-stone-900'
            ].join(' ')}
          >
            {Icon && <Icon aria-hidden='true' className='h-5 w-5 shrink-0' />}
            <span className='truncate'>{action.label}</span>
          </button>
        )
      })}

      {info.user && (
        <div className='flex min-w-0 items-center gap-2 pl-1'>
          <div
            aria-hidden='true'
            className='flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-white'
          >
            {info.user.avatar ?? <LuUserRound className='h-5 w-5' />}
          </div>
          <div className='flex min-w-0 flex-col leading-tight'>
            <span className='max-w-20 truncate text-xs font-semibold sm:max-w-36 sm:text-sm text-stone-900'>
              {info.user.name}
            </span>
            {info.user.description && (
              <span className='hidden max-w-36 truncate text-xs text-neutral sm:block'>
                {info.user.description}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  </header>
)

