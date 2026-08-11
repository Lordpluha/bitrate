import { LyricsPage } from '@views/Lyrics'
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Lyrics',
}

export default function LyricsRoute() {
  return <LyricsPage />
}
