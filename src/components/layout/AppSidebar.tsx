import type { RefObject } from 'react'
import { NavLink } from 'react-router-dom'
import type {
  HeaderContextItem,
  ModuleIdentity,
  NavigationItem
} from './types'

interface AppSidebarProps {
  id: string
  module: ModuleIdentity
  navigation: readonly NavigationItem[]
  context?: HeaderContextItem
  mobileOpen: boolean
  onNavigate: () => void
  ref: RefObject<HTMLElement | null>
}

export const AppSidebar = ({
  id,
  module,
  navigation,
  context,
  mobileOpen,
  onNavigate,
  ref
}: AppSidebarProps) => (
  <aside
    id={id}
    ref={ref}
    tabIndex={-1}
    role={mobileOpen ? 'dialog' : undefined}
    aria-modal={mobileOpen || undefined}
    aria-label={`Navegación de ${module.name}`}
    className={[
      'fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col justify-between overflow-y-auto border-r border-neutral/15 bg-bg-light py-4 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:min-h-screen lg:translate-x-0',
      mobileOpen
        ? 'visible translate-x-0'
        : 'invisible -translate-x-full lg:visible lg:translate-x-0'
    ].join(' ')}
  >
    <div className='flex flex-col gap-5'>
      <div className='flex items-center gap-3 px-4'>
        {module.logo && (
          <div
            aria-hidden='true'
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white'
          >
            {module.logo}
          </div>
        )}
        <div className='flex min-w-0 flex-col'>
          <span className='truncate text-base font-semibold tracking-tight text-stone-900'>
            {module.name}
          </span>
          {module.tagline && (
            <span className='mt-1 truncate text-[11px] font-medium uppercase tracking-wider text-neutral'>
              {module.tagline}
            </span>
          )}
        </div>
      </div>

      {context && (
        <div className='mx-4 rounded-xl bg-white/70 p-3'>
          <div className='flex items-center gap-2'>
            {context.icon && (
              <context.icon
                aria-hidden='true'
                className='h-4 w-4 shrink-0 text-primary'
              />
            )}
            <span className='text-xs font-medium uppercase tracking-wide text-neutral'>
              {context.label}
            </span>
          </div>
          <div className='mt-2 break-words text-sm font-semibold text-stone-900'>
            {context.value}
          </div>
        </div>
      )}

      <nav aria-label='Secciones' className='px-2'>
        <ul className='flex flex-col gap-1'>
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.end ?? true}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      isActive
                        ? 'bg-primary font-semibold text-white shadow-sm'
                        : 'text-neutral hover:bg-tertiary/50 hover:text-stone-900'
                    ].join(' ')
                  }
                >
                  {Icon && <Icon aria-hidden='true' className='h-5 w-5 shrink-0' />}
                  <span className='min-w-0 truncate'>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  </aside>
)
