import {
  ForgotPasswordForm,
  ResetPasswordForm,
  VerifyEmailForm,
} from '@features/Auth'
import { AuthCardShell } from '@widgets/AuthShell'

export const ForgotPasswordView = () => (
  <AuthCardShell>
    <ForgotPasswordForm />
  </AuthCardShell>
)

/** Reads `?token=`: render inside a Suspense boundary. */
export const ResetPasswordView = () => (
  <AuthCardShell>
    <ResetPasswordForm />
  </AuthCardShell>
)

/** Reads `?token=` and `?email=`: render inside a Suspense boundary. */
export const VerifyEmailView = () => (
  <AuthCardShell>
    <VerifyEmailForm />
  </AuthCardShell>
)
