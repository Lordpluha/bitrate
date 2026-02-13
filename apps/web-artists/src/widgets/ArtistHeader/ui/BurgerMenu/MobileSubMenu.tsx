'use client'

import { cn, Newspaper, YoutubeIcon } from '@spotify/ui-react'
import { ChevronLeft, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

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

interface MobileSubMenuProps {
  isOpen: boolean
  title: string
  data: SubmenuGroup[] | ResourceGroup[] | null
  type: 'features' | 'resources'
  onClose: () => void
  onFullClose: () => void
}

export const MobileSubMenu = ({ isOpen, title, data, type, onClose, onFullClose }: MobileSubMenuProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShouldAnimate(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setShouldAnimate(false)
    }
  }, [isOpen])

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-1051"
          onClick={onFullClose}
        />
      )}

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full bg-black z-1052 transform transition-transform duration-300 ease-in-out overflow-hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className={cn("p-5 h-full flex flex-col", 'max-sm:p-4')}>
          <div className={cn("flex items-center justify-between mb-10", 'max-sm:mb-0 py-2')}>
            <button
              onClick={onClose}
              className=" text-white hover:opacity-70 transition-opacity"
              aria-label="Go back"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <ChevronLeft className="w-8 h-8" />
              </div>
            </button>
            <h2 className="text-white text-2xl font-[700] absolute left-1/2 transform -translate-x-1/2">
              {title}
            </h2>
            <button
              onClick={onFullClose}
              className=" text-white hover:opacity-70 transition-opacity"
              aria-label="Close menu"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <X className="w-8 h-8" />
              </div>
            </button>
          </div>

          <div className={cn("flex-1 overflow-y-auto", 'max-sm:pt-6 px-2')}>
            {type === 'resources' ? (
              <div className={cn('flex flex-col gap-8')}>
                {(data as ResourceGroup[])?.map((group, index) => (
                  <div
                    key={group.title}
                    className={cn(
                      "flex flex-col gap-4 transition-all duration-900 ease-out",
                      shouldAnimate ? "opacity-100" : "opacity-0")}
                    style = {{
                      transitionDelay: shouldAnimate ? `${index * 200}ms` : '0ms'
                    }}
                    >
                <h3 className="text-neutral-400 text-base font-normal">
                  {group.title}
                </h3>

                <div className={cn(
                  "grid grid-cols-2 gap-4", 'max-sm:flex flex-col gap-y-8',

                )}>
                  {group.sections?.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={onFullClose}
                      className="flex flex-col gap-3 hover:opacity-80 transition-opacity"
                    >
                      {item.id === 'news' || item.id === 'videos' ? (
                        <div className={cn('flex items-center gap-4', 'max-sm:gap-2')}>
                          <h4 className={cn("text-white text-6xl font-[700] leading-tight", 'max-sm:text-5xl')}>
                            {item.title}
                          </h4>

                          {item.id === 'news' ? (
                            <Newspaper className={cn('w-10 h-10 text-white', 'max-sm:w-8 h-8')} />
                          ) : (
                            <YoutubeIcon className={cn('w-10 h-10 text-white', 'max-sm:w-8 h-8')} />
                          )}

                        </div>
                      ) : (
                        <>
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
                            <Image
                              src={item.imageSrc}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <h4 className={cn("text-white text-2xl font-[700] leading-tight", 'max-sm:text-xl')}>
                              {item.title}
                            </h4>
                            <p className={cn("text-white text-2xl font-[400] hover:opacity-70 transition-opacity leading-snug", 'max-sm:text-base')}>
                              {item.description}
                            </p>
                          </div>
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          ) : (
          <div className={cn("grid grid-cols-2 gap-x-6 gap-y-12", 'max-sm:flex flex-col gap-6')}>
            {(data as SubmenuGroup[])?.map((group, index) => (
              <div key={group.title}
                className={cn(
                  "flex flex-col gap-4 transition-all duration-900 ease-out",
                  'max-sm:gap-2',
                  shouldAnimate ? "opacity-100" : "opacity-0")}
                style={{
                  transitionDelay: shouldAnimate ? `${index * 200}ms` : '0ms'
                }}
              >
                <p className="text-neutral-400 text-base font-normal">
                  {group.title}
                </p>

                {group.sections && group.sections[0] && (
                  <Link
                    href={group.sections[0].href}
                    onClick={onFullClose}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <h3 className={cn('text-white text-4xl font-[700] leading-tight')}>
                      {group.sections[0].title}
                    </h3>
                  </Link>
                )}

                <nav className={cn("flex flex-col gap-4")}>
                  {group.sections?.slice(1).map((section) => (
                    <Link
                      key={section.href}
                      href={section.href}
                      className={cn("text-white text-2xl font-[700] hover:opacity-70 transition-opacity leading-snug", 'max-sm:text-xl')}
                      onClick={onFullClose}
                    >
                      {section.title}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
            )}
        </div>
      </div>
    </div >
    </>
  )
}
