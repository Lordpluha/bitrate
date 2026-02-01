'use client'

import React, { useState } from 'react'
import { cn } from '@spotify/ui-react'

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
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id)
            onTabChange?.(tab.id)
          }}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
            activeTab === tab.id
              ? 'bg-white text-black'
              : 'bg-gray-600/30 text-white hover:bg-gray-600/50',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
