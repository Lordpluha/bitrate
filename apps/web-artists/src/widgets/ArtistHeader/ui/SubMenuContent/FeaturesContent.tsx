'use client'

import { cn } from '@bitrate/ui-react'
import { memo } from 'react'
import type { SubmenuGroup } from './SubMenuContent.types'

export type FeaturesContentProps = { data: SubmenuGroup[] }

export const FeaturesContent = memo(({ data }: FeaturesContentProps) => {
  return (
    <div className="container pb-10 pt-8 grid grid-cols-4 gap-8">
      {data.map((group) => (
        <div key={group.title}>
          <h4 className="text-base text-neutral-400 font-normal">
            {group.title}
          </h4>

          {group.sections && group.sections.length > 0 && (
            <ul className="mt-4 space-y-2">
              {group.sections.map((section, idx) => (
                <li className={cn('mb-4 font-bold')} key={section.title}>
                  <a
                    className={cn(
                      'link-underline text-white',
                      idx === 0 && 'text-4xl',
                    )}
                    href={section.href}
                  >
                    {section.title}
                  </a>
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
