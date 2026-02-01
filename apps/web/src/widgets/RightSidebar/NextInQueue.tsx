import { Typography } from '@spotify/ui-react'
import React from 'react'

export const NextInQueue: React.FC = () => (
  <div className="bg-surface rounded-lg p-0 overflow-hidden mt-4">
    <div className="flex items-center justify-between px-4 pt-3 pb-1">
      <Typography
        as="p"
        size="body"
        className="text-text text-sm font-semibold"
      >
        Next in queue
      </Typography>
      <button className="text-grey-500 text-xs font-medium hover:underline">
        Open queue
      </button>
    </div>
    <div className="px-4 pb-4 flex items-center gap-3">
      <img
        src="/images/drive-cover.jpg"
        alt="Empathy"
        className="w-12 h-12 rounded-md object-cover"
      />
      <div>
        <Typography as="p" size="body" className="text-text text-sm">
          Empathy
        </Typography>
        <Typography as="p" size="body" className="text-grey-500 text-xs">
          Crystal Castles
        </Typography>
      </div>
    </div>
  </div>
)
