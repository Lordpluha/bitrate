import { TriangleAlert } from 'lucide-react'
import { StateMessage } from '@/shared/ui/StateMessage'

type RetryStateProps = {
  onRetry: () => void
  /** What is unavailable, e.g. "Friends are unavailable right now". */
  title: string
}

/** The error State/Message for a failed load, with a "Try again" action. */
export const RetryState = ({ onRetry, title }: RetryStateProps) => (
  <StateMessage
    description="Try again in a moment."
    icon={TriangleAlert}
    primary={{ label: 'Try again', onClick: onRetry }}
    title={title}
    tone="error"
  />
)
