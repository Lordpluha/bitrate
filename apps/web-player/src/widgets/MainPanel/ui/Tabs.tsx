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
          aria-pressed={activeTab === tab.id}
          className={cn(
            'flex h-8 items-center whitespace-nowrap rounded-full border px-3.5 text-[13px] text-foreground transition-colors duration-200',
            activeTab === tab.id
              ? 'border-primary bg-primary font-semibold text-primary-foreground'
              : 'border-border hover:bg-surface',
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
