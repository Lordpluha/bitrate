'use client'

import { useEffect, useState, useRef, useCallback, memo, useMemo } from 'react'
import { SwitchTransition, CSSTransition } from 'react-transition-group'
import { cn } from '@spotify/ui-react'
import Link from 'next/link'
import Image from 'next/image'

import './submenu-animation.css'

interface Section {
  title: string
  href: string
}

interface SubmenuGroup {
  title: string
  sections?: Section[]
}

interface ResourceItem {
  id: string
  title: string
  description: string
  imageSrc: string
  href: string
}

interface ResourceGroup {
  title: string
  sections?: ResourceItem[]
}

interface SubMenuContentProps {
  activeSubmenu: string | null
  submenuData: SubmenuGroup[] | ResourceGroup[] | null
  type: 'features' | 'resources'
  isClosing: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const SubMenuContent: React.FC<SubMenuContentProps> = ({
  activeSubmenu,
  submenuData,
  type,
  isClosing,
  onMouseEnter,
  onMouseLeave,
}) => {
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isVisible = (activeSubmenu && submenuData) || isClosing;

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
  }, [isVisible, submenuData, updateHeight])

  return (
    <div
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'fixed left-0 right-0 bg-black z-1051 top-18',
        'transition-all duration-300 ease-out',
        activeSubmenu && submenuData && !isClosing
          ? 'translate-y-0 opacity-100 pointer-events-auto visible'
          : '-translate-y-4 opacity-0 pointer-events-none invisible',
      )}
      style={{
        height: isVisible ? `${contentHeight}px` : '0px',
        overflow: 'hidden',
        transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={type}
          nodeRef={nodeRef}
          timeout={300}
          classNames="submenu-fade"
          onExiting={handleExiting}
          onExited={handleExited}
          onEntering={handleEntering}
          onEntered={handleEntered}
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

const FeaturesContent: React.FC<{ data: SubmenuGroup[] }> = memo(({ data }) => {
  return (
    <div className="container pb-10 pt-8 grid grid-cols-4 gap-8">
      {data.map((group) => (
        <div key={group.title}>memo(
          <h4 className="text-base text-neutral-400 font-normal">{group.title}</h4>

          {group.sections && group.sections.length > 0 && (
            <ul className="mt-4 space-y-2">
              {group.sections.map((section, idx) => (
                <li key={section.title} className={cn('mb-4 font-bold')}>
                  <Link
                    href={section.href}
                    className={cn(
                      'link-underline text-white',
                      idx === 0 && 'text-4xl',
                    )}
                  >
                    {section.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
})

FeaturesContent.displayName = 'FeaturesContent'

const ResourcesContent: React.FC<{ data: ResourceGroup[] }> = memo(({ data }) => {
  const allItems = useMemo(
    () => data.flatMap((group) => group.sections || []),
    [data]
  )
  
  const newsId = useMemo(
    () => allItems.find((d) => d.id === 'news')?.id ?? allItems[0]?.id ?? null,
    [allItems]
  )
  
  const [activeId, setActiveId] = useState<string | null>(newsId)
  const [lastActiveId, setLastActiveId] = useState<string | null>(newsId)

  const activeItem = useMemo(
    () => allItems.find((d) => d.id === activeId) || allItems[0],
    [allItems, activeId]
  )

  useEffect(() => {
    allItems.forEach((d) => {
      const img = new window.Image()
      img.src = d.imageSrc
    })
  }, [allItems])

  const handleEnter = useCallback((id: string) => {
    setActiveId(id)
    setLastActiveId(id)
    sessionStorage.setItem('resourcesActiveId', id)
  }, [])

  const handleLeave = useCallback(() => {
    setActiveId(lastActiveId)
  }, [lastActiveId])

  return (
    <div className="container grid grid-cols-12 gap-x-6 py-8">
      {data.map((group, groupIdx) => {
        const sections = group.sections || []
        const isFirstGroup = groupIdx === 0
        
        return (
          <section
            key={group.title}
            className={cn('flex flex-col gap-4', {
              'col-span-3': isFirstGroup,
              'col-span-3 gap-2': !isFirstGroup,
            })}
          >
            <h5 className="text-base text-neutral-400">{group.title}</h5>
            {sections.map((item, idx) => {
              const isLargeText = isFirstGroup
              return isLargeText ? (
                <h4 key={item.id} className="text-5xl text-neutral-400 font-bold">
                  <Link
                    href={item.href}
                    onMouseEnter={() => handleEnter(item.id)}
                    onMouseLeave={handleLeave}
                    onFocus={() => handleEnter(item.id)}
                    onBlur={handleLeave}
                    className={cn(
                      'link-underline',
                      'transition-colors duration-300',
                      {
                        'text-white': activeId === item.id,
                      },
                    )}
                  >
                    {item.title}
                  </Link>
                </h4>
              ) : (
                <h5 key={item.id} className="text-2xl text-neutral-400 font-bold">
                  <Link
                    href={item.href}
                    onMouseEnter={() => handleEnter(item.id)}
                    onMouseLeave={handleLeave}
                    onFocus={() => handleEnter(item.id)}
                    onBlur={handleLeave}
                    className={cn(
                      'link-underline',
                      'transition-colors duration-300',
                      {
                        'text-white': activeId === item.id,
                      },
                    )}
                  >
                    {item.title}
                  </Link>
                </h5>
              )
            })}
          </section>
        )
      })}

      <div
        className="col-span-6 row-span-2 relative rounded-lg overflow-hidden"
        style={{ height: '420px' }}
      >
        {allItems.map((img) => {
          const isActive = img.id === activeId
          return (
            <div
              key={img.id}
              className={cn(
                'absolute aspect-w-16 aspect-h-9 inset-0 transition-all duration-400 ease-in-out transform-gpu',
                {
                  'opacity-100 scale-100 z-20': isActive,
                  'opacity-0 scale-98 z-10 pointer-events-none': !isActive,
                },
              )}
              aria-hidden={!isActive}
            >
              <Image
                src={img.imageSrc}
                alt={img.title}
                className="object-cover"
                fill
                priority
              />
            </div>
          )
        })}
      </div>

      <div
        className="col-span-4 flex items-end text-neutral-400 text-base relative overflow-hidden"
        style={{ minHeight: '3rem' }}
      >
        <div key={activeId} className="animate-fade-in">
          <p aria-live="polite">{activeItem?.description || ''}</p>
        </div>
      </div>
    </div>
  )
})

ResourcesContent.displayName = 'ResourcesContent'
