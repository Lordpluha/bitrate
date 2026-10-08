import { Button, cn } from '@bitrate/ui-react'
import { X } from 'lucide-react'
import { type ReactNode, useEffect, useId, useRef } from 'react'

interface WorkspaceModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  canClose?: boolean
  className?: string
}

export function WorkspaceModal({
  title,
  onClose,
  children,
  canClose = true,
  className,
}: WorkspaceModalProps) {
  const titleId = useId()
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    element.showModal()
    element.querySelector<HTMLElement>('[data-initial-focus]')?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      element.close()
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true })
    }
  }, [])

  return (
    <dialog
      aria-labelledby={titleId}
      className={cn(
        'artist-dashboard artist-workspace-modal m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 text-foreground',
        className,
      )}
      onCancel={(event) => {
        event.preventDefault()
        if (canClose) onClose()
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < bounds.left ||
          event.clientX >= bounds.right ||
          event.clientY < bounds.top ||
          event.clientY >= bounds.bottom
        )
          if (canClose) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          if (canClose) onClose()
        }
      }}
      ref={dialog}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-medium" id={titleId}>
          {title}
        </h2>
        <Button
          aria-label="Close dialog"
          className="shrink-0"
          disabled={!canClose}
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <X aria-hidden="true" className="size-5" />
        </Button>
      </div>
      {children}
    </dialog>
  )
}
