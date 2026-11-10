import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

interface FloatingSectorPanelProps {
  anchorRef: RefObject<HTMLDivElement | null>
  children: ReactNode
  onClose: () => void
}

interface FloatingPosition {
  left: number
  top: number
  width: number
}

export const FloatingSectorPanel = ({
  anchorRef,
  children,
  onClose
}: FloatingSectorPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<FloatingPosition | null>(null)
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia('(max-width: 639px)').matches
  )

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    if (isMobile) {
      document.body.style.overflow = 'hidden'
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isMobile, onClose])

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  useLayoutEffect(() => {
    let frameId = 0

    const updatePosition = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(() => {
        const mobile = window.matchMedia('(max-width: 639px)').matches
        setIsMobile(mobile)

        if (mobile) {
          setPosition(null)
          return
        }

        const anchor = anchorRef.current
        if (!anchor) return

        const rect = anchor.getBoundingClientRect()
        const viewportPadding = 16
        const width = Math.min(
          Math.max(rect.width, 320),
          448,
          window.innerWidth - viewportPadding * 2
        )
        const left = Math.max(
          viewportPadding,
          Math.min(rect.left, window.innerWidth - width - viewportPadding)
        )
        const panelHeight = panelRef.current?.getBoundingClientRect().height ?? 360
        const below = rect.bottom + 8 + panelHeight <= window.innerHeight - viewportPadding
        const top = below
          ? rect.bottom + 8
          : Math.max(viewportPadding, rect.top - panelHeight - 8)

        setPosition({ left, top, width })
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(updatePosition)
    if (panelRef.current) resizeObserver?.observe(panelRef.current)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
      resizeObserver?.disconnect()
    }
  }, [anchorRef])

  return createPortal(
    <>
      <button
        type='button'
        aria-label='Cerrar selector de sectores'
        onClick={onClose}
        className='fixed inset-0 z-50 cursor-default bg-stone-950/30 sm:bg-transparent'
      />
      <div
        ref={panelRef}
        role='dialog'
        aria-label='Seleccionar sector de envío'
        aria-modal={isMobile || undefined}
        tabIndex={-1}
        className='fixed inset-x-3 bottom-3 z-[60] max-h-[85dvh] overflow-y-auto rounded-2xl bg-bg-light/95 p-2 shadow-[0_16px_48px_-12px_rgba(28,25,23,0.28)] backdrop-blur-xl sm:inset-auto sm:right-auto sm:bottom-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[min(28rem,calc(100vw-2rem))]'
        style={position ?? undefined}
      >
        {children}
      </div>
    </>,
    document.body
  )
}
