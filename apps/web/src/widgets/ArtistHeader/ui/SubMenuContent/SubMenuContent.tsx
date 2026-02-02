'use client'

import React from 'react'
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

interface SubMenuContentProps {
  activeSubmenu: string | null
  submenuData: SubmenuGroup[] | ResourceItem[] | null
  type: 'features' | 'resources'
  isClosing: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const linkUnderlineClasses = cn(
  'text-white font-bold',
  'relative inline-block',
  'before:content-[""]',
  'before:absolute before:left-0 before:-bottom-px',
  'before:h-0.5 before:w-full before:bg-white',
  'before:origin-left before:scale-x-0',
  'before:transition-transform before:duration-300 before:ease-in-out',
  'hover:before:scale-x-100',
)

export const SubMenuContent: React.FC<SubMenuContentProps> = ({
  activeSubmenu,
  submenuData,
  type,
  isClosing,
  onMouseEnter,
  onMouseLeave,
}) => {
  const nodeRef = React.useRef(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = React.useState<number>(0)
  const isVisible = (activeSubmenu && submenuData) || isClosing

  React.useEffect(() => {
    if (!contentRef.current) return

    const updateHeight = () => {
      if (contentRef.current && isVisible) {
        const height = contentRef.current.scrollHeight
        setContentHeight(height)
      } else {
        setContentHeight(0)
      }
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(() => {
      updateHeight()
    })

    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }

    const timeoutId = setTimeout(updateHeight, 100)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timeoutId)
    }
  }, [isVisible, type, submenuData])

  return (
    <div
      role="menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'fixed left-0 right-0 bg-black backdrop-blur-xl z-1051 top-[72px]',
        'transition-all duration-300 ease-out',
        activeSubmenu && submenuData && !isClosing
          ? 'translate-y-0 opacity-100 pointer-events-auto visible'
          : '-translate-y-4 opacity-0 pointer-events-none invisible',
      )}
      style={{
        maxHeight: isVisible ? `${contentHeight}px` : '0px',
        overflow: 'hidden',
      }}
    >
      <div ref={contentRef}>
        <SwitchTransition mode="out-in">
          <CSSTransition
            key={type}
            nodeRef={nodeRef}
            timeout={300}
            classNames="submenu-fade"
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
                  <ResourcesContent data={submenuData as ResourceItem[]} />
                )}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>
    </div>
  )
}

const FeaturesContent: React.FC<{ data: SubmenuGroup[] }> = ({ data }) => {
  return (
    <div className="container pb-10 pt-8 grid grid-cols-4 gap-8">
      {data.map((group) => (
        <div key={group.title}>
          <h4 className="text-base text-subdued font-bold">{group.title}</h4>

          {group.sections && group.sections.length > 0 && (
            <ul className="mt-4 space-y-2">
              {group.sections.map((section, idx) => (
                <li key={section.title} className={cn('mb-4')}>
                  <Link
                    href={section.href}
                    className={cn(
                      linkUnderlineClasses,
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
}

const ResourcesContent: React.FC<{ data: ResourceItem[] }> = ({ data }) => {
  const newsId = data.find((d) => d.id === 'news')?.id ?? data[0]?.id ?? null
  const [activeId, setActiveId] = React.useState<string | null>(newsId)
  const [lastActiveId, setLastActiveId] = React.useState<string | null>(newsId)

  const activeItem = data.find((d) => d.id === activeId) || data[0]

  React.useEffect(() => {
    data.forEach((d) => {
      const img = new window.Image()
      img.src = d.imageSrc
    })
  }, [data])

  const handleEnter = (id: string) => {
    setActiveId(id)
    setLastActiveId(id)
    sessionStorage.setItem('resourcesActiveId', id)
  }

  const handleLeave = () => {
    setActiveId(lastActiveId)
  }

  return (
    <div className="container grid grid-cols-12 gap-x-6 py-8">
      <section className="col-span-3 flex flex-col gap-4">
        <h5 className="text-base text-subdued">Deep dives</h5>
        {data.slice(0, 2).map((item) => (
          <h4 key={item.id} className="text-5xl font-bold">
            <Link
              href={item.href}
              onMouseEnter={() => handleEnter(item.id)}
              onMouseLeave={handleLeave}
              onFocus={() => handleEnter(item.id)}
              onBlur={handleLeave}
              className={cn(
                linkUnderlineClasses,
                'text-subdued transition-colors duration-300',
                {
                  'text-white': activeId === item.id,
                },
              )}
            >
              {item.title}
            </Link>
          </h4>
        ))}
      </section>

      <section className="col-span-3 flex flex-col gap-2">
        <h5 className="text-base text-subdued">Deep dives</h5>
        {data.slice(2).map((r) => (
          <h5 key={r.id} className="text-2xl font-semibold">
            <Link
              href={r.href}
              onMouseEnter={() => handleEnter(r.id)}
              onMouseLeave={handleLeave}
              onFocus={() => handleEnter(r.id)}
              onBlur={handleLeave}
              className={cn(
                linkUnderlineClasses,
                'text-subdued transition-colors duration-300',
                {
                  'text-white': activeId === r.id,
                },
              )}
            >
              {r.title}
            </Link>
          </h5>
        ))}
      </section>

      <div
        className="col-span-6 row-span-2 relative rounded-lg overflow-hidden"
        style={{ height: '420px' }}
      >
        {data.map((img) => {
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
        className="col-span-4 flex items-end text-subdued text-base relative overflow-hidden"
        style={{ minHeight: '3rem' }}
      >
        <div key={activeId} className="animate-fade-in">
          <p aria-live="polite">{activeItem?.description || ''}</p>
        </div>
      </div>
    </div>
  )
}
