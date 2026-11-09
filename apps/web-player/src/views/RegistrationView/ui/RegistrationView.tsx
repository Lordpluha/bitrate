import { RegistrationForm } from '@features/Registration'
import { AuthSplitShell } from '@widgets/AuthShell'

export const RegistrationView = () => (
  <AuthSplitShell headlineKey="auth.shell.registration">
    <RegistrationForm />
  </AuthSplitShell>
)
