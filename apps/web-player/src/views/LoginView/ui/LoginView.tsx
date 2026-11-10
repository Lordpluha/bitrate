import { LoginForm } from '@features/Login'
import { AuthSplitShell } from '@widgets/AuthShell'

export const LoginView = () => (
  <AuthSplitShell headlineKey="auth.shell.login">
    <LoginForm />
  </AuthSplitShell>
)
