import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/shared/routes'
import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'

export const AccountSettingsSection = () => (
  <SettingsSection title="Account">
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-text-subdued">Edit login methods</p>
      <Link
        className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-bold text-text transition-colors hover:border-white"
        href={ROUTES.profile}
      >
        Edit
        <ExternalLink size={16} />
      </Link>
    </div>
  </SettingsSection>
)
