'use client'

import { Button, cn } from '@spotify/ui-react'
import React, { useState } from 'react'
import { LoginModal, SignUpModal } from '@features/AuthModal'

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
          onClick={openSignUp}
          variant="ghost"
          className="text-base font-semibold text-text xl:justify-center justify-start py-3 rounded-full h-12 min-w-25"
        >
          Sign up
        </Button>

        <Button
          onClick={openLogin}
          variant="default"
          className="px-8 py-3 rounded-full font-bold text-base h-12 min-w-25 xl:justify-center justify-start"
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
