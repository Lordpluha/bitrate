'use client'

import { cn, Popover, PopoverContent, PopoverTrigger } from '@bitrate/ui-react'
import { Laptop, MonitorSpeaker, Smartphone, Speaker } from 'lucide-react'
import { useState } from 'react'
import { Z_INDEX_CLASS } from '@/shared/constants'
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime'
import { usePlayerDevices } from '../api/connectApi'
import { readThisDeviceId } from '../lib/thisDevice'
import type { PlayerDevice } from '../model/connect.schemas'

const DEVICE_ICONS = {
  desktop: Laptop,
  mobile: Smartphone,
  other: MonitorSpeaker,
  speaker: Speaker,
  web: MonitorSpeaker,
} as const satisfies Record<PlayerDevice['type'], typeof MonitorSpeaker>

type ConnectDevicesPopoverProps = {
  triggerClassName?: string
}

/**
 * Bitrate Connect: the account's devices. Each one continues the shared queue where it was
 * left; playback itself stays on the device that plays it.
 */
export const ConnectDevicesPopover = ({
  triggerClassName,
}: ConnectDevicesPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { data, isError, isPending } = usePlayerDevices(isOpen)
  const thisDeviceId = isOpen ? readThisDeviceId() : null

  return (
    <Popover onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger
        aria-label="Open Bitrate Connect"
        className={triggerClassName}
      >
        <MonitorSpeaker aria-hidden="true" size={22} />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className={cn(
          Z_INDEX_CLASS.popover,
          'w-[min(20rem,calc(100vw-2rem))] rounded-md border border-border bg-popover p-0 text-text shadow-2xl',
        )}
        positionerClassName={Z_INDEX_CLASS.popover}
        sideOffset={8}
      >
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-bold">Bitrate Connect</h2>
          <p className="text-xs leading-5 text-text-subdued">
            Sign in on another device to continue this queue there.
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto p-2 custom-scrollbar">
          {isPending ? (
            <p
              className="px-3 py-6 text-center text-sm text-text-subdued"
              role="status"
            >
              Loading devices…
            </p>
          ) : isError ? (
            <p
              className="px-3 py-6 text-center text-sm text-text-subdued"
              role="status"
            >
              Devices are unavailable right now.
            </p>
          ) : (
            <ul className="grid gap-1">
              {data.map((device) => {
                const Icon = DEVICE_ICONS[device.type]
                const isThisDevice = device.id === thisDeviceId
                return (
                  <li
                    className="flex items-center gap-3 rounded px-3 py-2"
                    key={device.id}
                  >
                    <Icon
                      aria-hidden="true"
                      className={
                        device.isActive ? 'text-primary' : 'text-text-subdued'
                      }
                      size={20}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {device.name}
                        {isThisDevice ? ' · This browser' : ''}
                      </p>
                      <p className="text-xs text-text-subdued">
                        {device.isActive
                          ? 'Playing here last'
                          : `Seen ${formatRelativeTime({ date: device.lastSeenAt })}`}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
