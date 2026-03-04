'use client'

import { LoginModal, SignUpModal } from '@features/AuthModal'
import { Button } from '@spotify/ui-react'
import { useState } from 'react'

export const AuthButtons = () => {
  const [loginOpen, setLoginOpen] = useState(false)
  const [signUpOpen, setSignUpOpen] = useState(false)

  const openLogin = () => {
    setSignUpOpen(false)
    setLoginOpen(true)
  }

  const openSignUp = () => {
    setLoginOpen(false)
    setSignUpOpen(true)
  }

  return (
    <>
      <div className="flex items-center xl:gap-8 flex-row space-y-4 xl:space-y-0">
        <Button
          className="text-base font-semibold text-text xl:justify-center justify-start py-3 rounded-full h-12 min-w-25"
          onClick={openSignUp}
          variant="ghost"
        >
          Sign up
        </Button>

        <Button
          className="px-8 py-3 rounded-full font-bold text-base h-12 min-w-25 xl:justify-center justify-start"
          onClick={openLogin}
          variant="default"
        >
          Log in
        </Button>
      </div>

      <LoginModal
        isOpen={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignUp={openSignUp}
      />

      <SignUpModal
        isOpen={signUpOpen}
        onOpenChange={setSignUpOpen}
        onSwitchToLogin={openLogin}
      />
    </>
  )
}
