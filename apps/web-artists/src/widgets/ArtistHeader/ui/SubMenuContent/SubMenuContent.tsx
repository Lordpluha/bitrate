'use client'

import { cn } from '@spotify/ui-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

import './submenu-animation.css'
import { FeaturesContent } from './FeaturesContent'
import { ResourcesContent } from './ResourcesContent'
import type {
  ResourceGroup,
  SubMenuContentProps,
  SubmenuGroup,
} from './SubMenuContent.types'

export const SubMenuContent = ({
  activeSubmenu,
  submenuData,
  type,
  isClosing,
  onMouseEnter,
  onMouseLeave,
}: SubMenuContentProps) => {
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const [_isTransitioning, setIsTransitioning] = useState(false)
  const isVisible = (activeSubmenu && submenuData) || isClosing

  const updateHeight = useCallback((immediate = false) => {
    if (!nodeRef.current) {
      setContentHeight(0)
      return
    }

    const height = nodeRef.current.scrollHeight
    if (immediate) {
      setContentHeight(height)
    } else {
      requestAnimationFrame(() => {
        setContentHeight(height)
      })
    }
  }, [])

  const handleExiting = useCallback(() => {
    setIsTransitioning(true)
    if (nodeRef.current) {
      setContentHeight(nodeRef.current.scrollHeight)
    }
  }, [])

  const handleExited = useCallback(() => {
    setIsTransitioning(false)
  }, [])

  const handleEntering = useCallback(() => {
    setIsTransitioning(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (nodeRef.current) {
          setContentHeight(nodeRef.current.scrollHeight)
        }
      })
    })
  }, [])

  const handleEntered = useCallback(() => {
    setIsTransitioning(false)
    if (nodeRef.current) {
      setContentHeight(nodeRef.current.scrollHeight)
    }
  }, [])

  useEffect(() => {
    if (!isVisible) {
      setContentHeight(0)
      return
    }
    updateHeight(true)
  }, [isVisible, updateHeight])

  return (
    <div
      className={cn(
        'fixed left-0 right-0 bg-black z-1051 top-18',
        'transition-all duration-300 ease-out',
        activeSubmenu && submenuData && !isClosing
          ? 'translate-y-0 opacity-100 pointer-events-auto visible'
          : '-translate-y-4 opacity-0 pointer-events-none invisible',
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
      style={{
        height: isVisible ? `${contentHeight}px` : '0px',
        overflow: 'hidden',
        transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <SwitchTransition mode="out-in">
        <CSSTransition
          classNames="submenu-fade"
          key={type}
          nodeRef={nodeRef}
          onEntered={handleEntered}
          onEntering={handleEntering}
          onExited={handleExited}
          onExiting={handleExiting}
          timeout={300}
        >
          <div ref={nodeRef}>
            {type === 'features' &&
              submenuData &&
              Array.isArray(submenuData) && (
                <FeaturesContent data={submenuData as SubmenuGroup[]} />
              )}
            {type === 'resources' &&
              submenuData &&
              Array.isArray(submenuData) && (
                <ResourcesContent data={submenuData as ResourceGroup[]} />
              )}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  )
}
