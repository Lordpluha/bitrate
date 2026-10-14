import { LoginForm } from '@features/Login'
import { AuthSplitShell } from '@widgets/AuthShell'

export const LoginView = () => (
  <AuthSplitShell headline="Your music, ready when you are.">
    <LoginForm />
  </AuthSplitShell>
)
