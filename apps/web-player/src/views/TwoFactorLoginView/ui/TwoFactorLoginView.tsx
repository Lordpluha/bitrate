import { TwoFactorLoginForm } from '@features/Auth'
import { AuthSplitShell } from '@widgets/AuthShell'

export const TwoFactorLoginView = () => (
  <AuthSplitShell headline="One more step.">
    <TwoFactorLoginForm />
  </AuthSplitShell>
)
