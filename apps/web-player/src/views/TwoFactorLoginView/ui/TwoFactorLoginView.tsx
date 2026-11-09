import { TwoFactorLoginForm } from '@features/Auth'
import { AuthSplitShell } from '@widgets/AuthShell'

export const TwoFactorLoginView = () => (
  <AuthSplitShell headlineKey="auth.shell.twoFactor">
    <TwoFactorLoginForm />
  </AuthSplitShell>
)
