'use client'

import { cn } from '@bitrate/ui-react'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import type { ResourceGroup } from './SubMenuContent.types'

export type ResourcesContentProps = { data: ResourceGroup[] }

export const ResourcesContent = memo(({ data }: ResourcesContentProps) => {
  const allItems = useMemo(
    () => data.flatMap((group) => group.sections || []),
    [data],
  )

  const newsId = useMemo(
    () => allItems.find((d) => d.id === 'news')?.id ?? allItems[0]?.id ?? null,
    [allItems],
  )

  const [activeId, setActiveId] = useState<string | null>(newsId)
  const [lastActiveId, setLastActiveId] = useState<string | null>(newsId)

  const activeItem = useMemo(
    () => allItems.find((d) => d.id === activeId) || allItems[0],
    [allItems, activeId],
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
            className={cn('flex flex-col gap-4', {
              'col-span-3': isFirstGroup,
              'col-span-3 gap-2': !isFirstGroup,
            })}
            key={group.title}
          >
            <h5 className="text-base text-neutral-400">{group.title}</h5>
            {sections.map((item) => {
              const isLargeText = isFirstGroup
              return isLargeText ? (
                <h4
                  className="text-5xl text-neutral-400 font-bold"
                  key={item.id}
                >
                  <Link
                    className={cn(
                      'link-underline',
                      'transition-colors duration-300',
                      {
                        'text-white': activeId === item.id,
                      },
                    )}
                    href={item.href}
                    onBlur={handleLeave}
                    onFocus={() => handleEnter(item.id)}
                    onMouseEnter={() => handleEnter(item.id)}
                    onMouseLeave={handleLeave}
                  >
                    {item.title}
                  </Link>
                </h4>
              ) : (
                <h5
                  className="text-2xl text-neutral-400 font-bold"
                  key={item.id}
                >
                  <Link
                    className={cn(
                      'link-underline',
                      'transition-colors duration-300',
                      {
                        'text-white': activeId === item.id,
                      },
                    )}
                    href={item.href}
                    onBlur={handleLeave}
                    onFocus={() => handleEnter(item.id)}
                    onMouseEnter={() => handleEnter(item.id)}
                    onMouseLeave={handleLeave}
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
              aria-hidden={!isActive}
              className={cn(
                'absolute aspect-w-16 aspect-h-9 inset-0 transition-all duration-400 ease-in-out transform-gpu',
                {
                  'opacity-100 scale-100 z-20': isActive,
                  'opacity-0 scale-98 z-10 pointer-events-none': !isActive,
                },
              )}
              key={img.id}
            >
              <Image
                alt={img.title}
                className="object-cover"
                fill
                priority
                src={img.imageSrc}
              />
            </div>
          )
        })}
      </div>

      <div
        className="col-span-4 flex items-end text-neutral-400 text-base relative overflow-hidden"
        style={{ minHeight: '3rem' }}
      >
        <div className="animate-fade-in" key={activeId}>
          <p aria-live="polite">{activeItem?.description || ''}</p>
        </div>
      </div>
    </div>
  )
})

ResourcesContent.displayName = 'ResourcesContent'
