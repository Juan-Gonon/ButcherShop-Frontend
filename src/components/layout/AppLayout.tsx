import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import type { AppLayoutProps } from './types'

const SIDEBAR_ID = 'app-sidebar'

export const AppLayout = ({ config }: AppLayoutProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const wasDrawerOpen = useRef(false)

  useEffect(() => {
    if (!drawerOpen) {
      if (wasDrawerOpen.current) {
        menuButtonRef.current?.focus()
      }
      wasDrawerOpen.current = false
      return
    }

    wasDrawerOpen.current = true
    const firstLink = sidebarRef.current?.querySelector<HTMLElement>('a[href]')
    if (firstLink) {
      firstLink.focus()
    } else {
      sidebarRef.current?.focus()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [drawerOpen])

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 64rem)')
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setDrawerOpen(false)
      }
    }

    desktopQuery.addEventListener('change', closeOnDesktop)
    return () => desktopQuery.removeEventListener('change', closeOnDesktop)
  }, [])

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <div className='flex min-h-screen w-full min-w-0 overflow-x-clip bg-bg-light'>
      <AppSidebar
        id={SIDEBAR_ID}
        ref={sidebarRef}
        module={config.module}
        navigation={config.navigation}
        context={config.sidebarContext}
        mobileOpen={drawerOpen}
        onNavigate={closeDrawer}
      />

      {drawerOpen && (
        <button
          type='button'
          aria-hidden='true'
          tabIndex={-1}
          onClick={closeDrawer}
          className='fixed inset-0 z-40 cursor-default bg-stone-950/40 lg:hidden'
        />
      )}

      <div
        inert={drawerOpen}
        className='flex min-h-screen min-w-0 flex-1 flex-col'
      >
        <AppHeader
          info={config.header}
          actions={config.headerActions}
          isMenuOpen={drawerOpen}
          onMenuToggle={() => setDrawerOpen((isOpen) => !isOpen)}
          menuControlsId={SIDEBAR_ID}
          menuButtonRef={menuButtonRef}
        />
        <main className='min-w-0 flex-1 overflow-x-clip px-4 py-5 sm:px-6'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

