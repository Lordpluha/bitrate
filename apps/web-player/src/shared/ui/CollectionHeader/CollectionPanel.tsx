import type { PropsWithChildren } from 'react'

/**
 * The scrolling main panel of a collection page (playlist, album, Liked Songs): the design's
 * 24/32 padding with 28px between the header, the action bar and the track table. Phones use
 * the mobile frame's 8/16 padding and 20px rhythm. It fills the panel's height, so an empty or
 * error State/Message below the header takes the rest of it and sits in the middle.
 */
export const CollectionPanel = ({ children }: PropsWithChildren) => (
  <div className="flex h-full flex-1 flex-col overflow-y-auto custom-scrollbar">
    <div className="flex flex-1 flex-col gap-5 px-4 pt-2 pb-3 md:gap-7 md:px-8 md:py-6">
      {children}
    </div>
  </div>
)
