import { Button } from '@bitrate/ui-react'
import type { ArtistIdentity } from '@shared/auth/artistSession.types'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { DashboardAccountMenu } from './DashboardAccountMenu'
import { DashboardDesignNavigation } from './DashboardDesignNavigation'
import { DashboardSupport } from './DashboardSupport'

interface DashboardMobileMenuProps {
  artist: ArtistIdentity
}

export function DashboardMobileMenu({ artist }: DashboardMobileMenuProps) {
  const [open, setOpen] = useState(false)
  const dialogId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (!open) {
      if (element.open) element.close()
      return
    }
    element.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // The trigger follows the shared lg breakpoint. Close the modal when it disappears.
    const closeOnDesktop = () => {
      if (trigger.current?.getClientRects().length === 0) setOpen(false)
    }
    window.addEventListener('resize', closeOnDesktop)
    return () => {
      window.removeEventListener('resize', closeOnDesktop)
      document.body.style.overflow = previousOverflow
      if (element.open) element.close()
    }
  }, [open])

  return (
    <>
      <Button
        aria-controls={dialogId}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Open workspace menu"
        className="size-11 shrink-0 bg-card text-text-secondary"
        onClick={() => setOpen(true)}
        ref={trigger}
        size="icon"
        variant="ghost"
      >
        <Menu aria-hidden="true" className="size-5" />
      </Button>
      <dialog
        aria-label="Workspace menu"
        className="artist-dashboard artist-dashboard-menu fixed inset-y-0 left-0 m-0 flex h-dvh max-h-none w-[calc(100vw-4rem)] max-w-80 flex-col rounded-none border-0 border-r border-border bg-card p-3 text-foreground shadow-none"
        id={dialogId}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          if (
            event.clientX < bounds.left ||
            event.clientX >= bounds.right ||
            event.clientY < bounds.top ||
            event.clientY >= bounds.bottom
          )
            setOpen(false)
        }}
        onClose={(event) => {
          if (!event.currentTarget.open) setOpen(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
        ref={dialog}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 px-3 pb-14 pt-3">
          <Link
            aria-label="Bitrate for Artists dashboard"
            className="flex min-h-11 items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setOpen(false)}
            preload={false}
            to={ROUTES.dashboard.home}
          >
            <img
              alt=""
              className="mt-1 shrink-0"
              height={32}
              src="/bitrate-logo.svg"
              width={32}
            />
            <span>
              <span className="block text-[1.375rem]">Bitrate</span>
              <span className="block text-[0.625rem] uppercase tracking-wide text-text-secondary">
                For artists
              </span>
            </span>
          </Link>
          <Button
            aria-label="Close workspace menu"
            className="size-11 shrink-0 bg-secondary text-text-secondary"
            onClick={() => setOpen(false)}
            size="icon"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <p className="mb-4 px-3 text-[0.625rem] uppercase tracking-wide text-text-secondary">
            Artist workspace
          </p>
          <div className="w-full max-w-56">
            <DashboardDesignNavigation onNavigate={() => setOpen(false)} />
          </div>
        </div>
        <div className="mb-2 mt-6 flex w-full max-w-56 shrink-0 flex-col gap-6 pb-[env(safe-area-inset-bottom)]">
          <DashboardSupport onOpen={() => setOpen(false)} />
          <DashboardAccountMenu artist={artist} onOpen={() => setOpen(false)} />
        </div>
      </dialog>
    </>
  )
}
