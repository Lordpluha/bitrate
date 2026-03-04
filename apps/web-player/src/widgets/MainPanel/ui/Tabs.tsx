'use client'

import { cn } from '@spotify/ui-react'
import type React from 'react'
import { useState } from 'react'

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  onTabChange?: (id: string) => void
}

export const Tabs: React.FC<TabsProps> = ({ tabs, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  return (
    <div className="flex items-center justify-start gap-2">
      {tabs.map((tab) => (
        <button
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-white text-black'
              : 'bg-black-800 text-white hover:bg-gray-600/50',
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
