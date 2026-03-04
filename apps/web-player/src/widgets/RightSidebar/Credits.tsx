import { Button, Typography } from '@spotify/ui-react'
import type React from 'react'

export const Credits: React.FC = () => (
  <div className="bg-surface rounded-lg p-0 overflow-hidden mt-4">
    <div className="flex items-center justify-between px-4 pt-3 pb-1">
      <div className="text-text text-sm font-semibold">Credits</div>
      <Button
        className="text-grey-500 text-xs font-medium hover:underline"
        variant="link"
      >
        Show all
      </Button>
    </div>
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <Typography as="p" className="text-text text-sm" size="body">
            Crystal Castles
          </Typography>
          <Typography as="p" className="text-grey-500  text-xs" size="body">
            Main Artist
          </Typography>
        </div>
        <Button className="h-auto text-xs px-2 py-1" variant="default">
          Follow
        </Button>
      </div>
      <div className="mb-2">
        <Typography as="p" className="text-text text-sm" size="body">
          Van She
        </Typography>
        <Typography as="p" className="text-grey-500  text-xs" size="body">
          Composer
        </Typography>
      </div>
      <div>
        <Typography as="p" className="text-text text-sm" size="body">
          Ethan Kath
        </Typography>
        <Typography as="p" className="text-grey-500 text-xs" size="body">
          Composer, Producer
        </Typography>
      </div>
    </div>
  </div>
)
