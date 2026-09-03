import { Spinner } from '@bitrate/ui-react'

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center rounded-lg bg-background-secondary text-text">
      <Spinner />
    </div>
  )
}
