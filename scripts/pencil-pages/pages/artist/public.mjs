// Public artist pages (signed out): landing, auth, legal, not-found and the session error, drawn on the
// artist library over the living-workspace backdrop without the workspace shell.
import { forgotPasswordPage } from './public/forgot-password.mjs'
import { publicFrames } from './public/frames.mjs'
import { landingPage } from './public/landing.mjs'
import { legalPage } from './public/legal.mjs'
import { loginPage } from './public/login.mjs'
import { notFoundPage } from './public/not-found.mjs'
import { registrationPage } from './public/registration.mjs'
import { resetPasswordPage } from './public/reset-password.mjs'
import { sessionErrorPage } from './public/session-error.mjs'
import { verifyEmailPage } from './public/verify-email.mjs'

/** The public pages by directory. */
export function publicPages(ui) {
  const frames = publicFrames(ui)
  return {
    landing: landingPage(ui, frames),
    login: loginPage(ui, frames),
    registration: registrationPage(ui, frames),
    'forgot-password': forgotPasswordPage(ui, frames),
    'reset-password': resetPasswordPage(ui, frames),
    'verify-email': verifyEmailPage(ui, frames),
    legal: legalPage(ui, frames),
    'not-found': notFoundPage(ui, frames),
    'session-error': sessionErrorPage(ui, frames),
  }
}
