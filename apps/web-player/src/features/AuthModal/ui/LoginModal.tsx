'use client'

import { useLoginModalForm } from '@features/AuthModal/model/useLoginModalForm'
import { ROUTES } from '@shared/routes'
import { SocialsAuthDivider } from '@shared/ui'
import { Button, Form } from '@spotify/ui-react'
import Link from 'next/link'
import { AuthModalGoogleButton, AuthModalHeader } from './AuthModalHeader'
import { LoginModalFields } from './LoginModalFields'
import { Modal } from './Modal'

interface LoginModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignUp?: () => void
}

export const LoginModal = ({
  isOpen,
  onOpenChange,
  onSwitchToSignUp,
}: LoginModalProps) => {
  const { form, isLoading, onSubmit } = useLoginModalForm(() =>
    onOpenChange(false),
  )

  return (
    <Modal
      ariaLabel="Sign in"
      className="w-full max-w-125"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col items-stretch justify-center gap-4 rounded-lg bg-contrast p-8 text-text-contrast">
        <AuthModalHeader
          description="Please login to continue to your account."
          title="Sign in"
        />
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <LoginModalFields control={form.control} />
            <Link
              className="text-right text-sm text-green-500 hover:underline"
              href={ROUTES.auth.forgotPassword}
            >
              Forgot password?
            </Link>
            <div className="mt-2 flex flex-col items-stretch gap-4">
              <Button
                aria-busy={isLoading}
                className="rounded"
                disabled={isLoading}
                isLoading={isLoading}
                type="submit"
                variant="primary"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </Button>
              <SocialsAuthDivider />
              <AuthModalGoogleButton />
              <p className="text-center text-base text-text-contrast">
                Don&apos;t have an account?{' '}
                <button
                  className="font-bold text-green-500 underline hover:no-underline"
                  onClick={() => {
                    if (onSwitchToSignUp) onSwitchToSignUp()
                    else onOpenChange(false)
                  }}
                  type="button"
                >
                  Sign up.
                </button>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  )
}
