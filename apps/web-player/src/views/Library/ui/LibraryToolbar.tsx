'use client'

import type { LibraryControls } from '@/views/Library/model/library.types'
import { LibraryDesktopControls } from './LibraryDesktopControls'
import { LibraryMobileControls } from './LibraryMobileControls'
import { LibraryTabs } from './LibraryTabs'

type LibraryToolbarProps = {
  controls: LibraryControls
  onChange: (controls: Partial<LibraryControls>) => void
}

export const LibraryToolbar = ({ controls, onChange }: LibraryToolbarProps) => (
  <>
    <LibraryTabs controls={controls} onChange={onChange} />
    <LibraryMobileControls controls={controls} onChange={onChange} />
    <LibraryDesktopControls controls={controls} onChange={onChange} />
  </>
)
