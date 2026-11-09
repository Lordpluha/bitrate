import type { PropsWithChildren } from 'react'

/**
 * The scrolling main panel of a collection page (playlist, album, Liked Songs): the design's
 * 24/32 padding with 28px between the header, the action bar and the track table. Phones use
 * the mobile frame's 8/16 padding and 20px rhythm. The column fills the panel's height so an
 * empty state below the header centres in the space that is left.
 */
export const CollectionPanel = ({ children }: PropsWithChildren) => (
  <div className="h-full overflow-y-auto custom-scrollbar">
    <div className="flex min-h-full flex-col gap-5 px-4 pt-2 pb-3 md:gap-7 md:px-8 md:py-6">
      {children}
    </div>
  </div>
)
