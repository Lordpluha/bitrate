'use client'

import React, { useEffect } from 'react'
import { cn } from '@spotify/ui'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  children,
  className
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 w-[100vw] bg-black/60 backdrop-blur-sm" />

      <div
        className={cn(
          'relative z-10 max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg shadow-xl',
          'animate-in zoom-in-95 duration-200',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal
