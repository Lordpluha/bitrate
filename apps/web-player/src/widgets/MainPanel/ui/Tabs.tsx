'use client'

import { cn } from '@bitrate/ui-react'
import { useState } from 'react'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  onTabChange?: (id: string) => void
}

export const Tabs = ({ tabs, onTabChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  return (
    <div className="flex items-center justify-start gap-2">
      {tabs.map((tab) => (
        <button
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-text text-background'
              : 'bg-surface text-text hover:bg-surface-hover',
          )}
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id)
            onTabChange?.(tab.id)
          }}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
