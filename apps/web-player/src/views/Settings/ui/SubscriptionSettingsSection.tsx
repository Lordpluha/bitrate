'use client'

import { useSubscription } from '@/entities/Me'
import { useAuth } from '@/shared/hooks'
import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'

const formatPlan = (plan: string) =>
  plan
    .toLocaleLowerCase()
    .split('_')
    .map((part) => `${part.charAt(0).toLocaleUpperCase()}${part.slice(1)}`)
    .join(' ')

export const SubscriptionSettingsSection = () => {
  const { isAuthenticated } = useAuth()
  const { data: subscription, isPending } = useSubscription(isAuthenticated)

  if (!isAuthenticated) return null

  return (
    <SettingsSection searchTerms={['plan', 'premium']} title="Your plan">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-md bg-surface px-4 py-3">
        <div>
          <p className="font-bold text-text">
            {isPending
              ? 'Loading plan...'
              : formatPlan(subscription?.plan ?? 'FREE')}
          </p>
          <p className="mt-1 text-xs text-text-subdued">
            {subscription?.status === 'ACTIVE'
              ? 'Your subscription is active.'
              : 'Review your subscription status.'}
          </p>
        </div>
        {subscription && (
          <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-bold text-text">
            {subscription.status}
          </span>
        )}
      </div>
    </SettingsSection>
  )
}
