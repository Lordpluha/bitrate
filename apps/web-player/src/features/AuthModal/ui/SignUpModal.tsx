'use client'

import { useSignUpModalForm } from '@features/AuthModal/model/useSignUpModalForm'
import { ROUTES } from '@shared/routes'
import { SocialsAuthDivider } from '@shared/ui'
import { Button, Form } from '@spotify/ui-react'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import { AuthModalGoogleButton, AuthModalHeader } from './AuthModalHeader'
import { Modal } from './Modal'
import { SignUpModalFields } from './SignUpModalFields'

interface SignUpModalProps extends ComponentProps<typeof Modal> {
  onSwitchToLogin?: () => void
}

export const SignUpModal = ({
  onSwitchToLogin,
  ...modalProps
}: SignUpModalProps) => {
  const { form, isRegistering, onSubmit } = useSignUpModalForm(onSwitchToLogin)

  return (
    <Modal
      {...modalProps}
      ariaLabel="Create account"
      className="w-full max-w-125"
    >
      <div className="flex flex-col items-stretch justify-center gap-4 rounded-lg bg-contrast p-8 text-text-contrast">
        <AuthModalHeader
          description="Sign up to enjoy the features of Spotify."
          title="Sign Up"
        />
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <SignUpModalFields control={form.control} />
            <div className="mt-2 flex flex-col items-stretch gap-4">
              <Button
                aria-busy={isRegistering}
                className="rounded"
                disabled={isRegistering}
                isLoading={isRegistering}
                type="submit"
                variant="primary"
              >
                Register
              </Button>
              <SocialsAuthDivider />
              <AuthModalGoogleButton />
              <p className="text-center text-base text-text-contrast">
                Already have an account?{' '}
                {onSwitchToLogin ? (
                  <button
                    className="font-bold text-green-500 underline hover:no-underline"
                    onClick={onSwitchToLogin}
                    type="button"
                  >
                    Log in.
                  </button>
                ) : (
                  <Link
                    className="font-bold text-green-500 underline hover:no-underline"
                    href={ROUTES.auth.login}
                  >
                    Log in.
                  </Link>
                )}
              </p>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  )
}
