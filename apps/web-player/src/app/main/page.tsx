import { MainPanel } from '@widgets/MainPanel'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
}

export default function MainPage() {
  return <MainPanel />
}
