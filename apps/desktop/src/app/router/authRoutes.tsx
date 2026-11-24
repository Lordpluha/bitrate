import { ROUTES } from '@shared/routes'
import { ForgotPasswordView, ResetPasswordView, VerifyEmailView } from '@views/AuthRecovery'
import { LoginView } from '@views/LoginView'
import { RegistrationView } from '@views/RegistrationView'
import { TwoFactorLoginView } from '@views/TwoFactorLoginView'
import { createRoute, Outlet, redirect } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import type { ScreenComponent } from './errorComponents'

/** Sign-in, sign-up and recovery: full-window, as web-player's `(auth)` group. */
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth-layout',
  component: () => (
    <div className="min-h-dvh bg-background text-foreground">
      <Outlet />
    </div>
  ),
})

const authScreen = (path: string, component: ScreenComponent) =>
  createRoute({ getParentRoute: () => authLayoutRoute, path, component })

/** The desktop app has no marketing landing: `/` opens the player (or login, if signed out). */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ href: ROUTES.main })
  },
})

export const authRouteTree = [
  indexRoute,
  authLayoutRoute.addChildren([
    authScreen(ROUTES.auth.login, LoginView),
    authScreen(ROUTES.auth.twoFactorLogin, TwoFactorLoginView),
    authScreen(ROUTES.auth.registration, RegistrationView),
    authScreen(ROUTES.auth.forgotPassword, ForgotPasswordView),
    authScreen(ROUTES.auth.resetPassword(), ResetPasswordView),
    authScreen(ROUTES.auth.verifyEmail(), VerifyEmailView),
  ]),
]
