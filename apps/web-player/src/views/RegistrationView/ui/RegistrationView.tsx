import { RegistrationForm } from '@features/Registration'
import { AuthSplitShell } from '@widgets/AuthShell'

export const RegistrationView = () => (
  <AuthSplitShell headline="Start listening for free.">
    <RegistrationForm />
  </AuthSplitShell>
)
