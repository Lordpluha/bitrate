'use client'

import { Button } from '@spotify/ui'
import React, { useState } from 'react'
import { LoginModal, SignUpModal } from '@features/AuthModal'
import { Ghost } from 'lucide-react'

interface AuthButtonsProps {
  isMobile?: boolean
}

export const AuthButtons = ({ isMobile = false }: AuthButtonsProps) => {
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
      <div className={`flex items-start ${isMobile ? 'flex-col space-y-4' : 'gap-8'}`}>
        <Button
          onClick={openSignUp}
          variant="ghost"
          className={`hover:opacity-70 transition-[.3s] text-base font-semibold text-text ${
            isMobile ? 'justify-start py-3' : ''
          }`}
        >
          Sign up
        </Button>

        <Button
          onClick={openLogin}
          variant="default"
          className={`bg-white text-black hover:bg-grey-400 hover:opacity-70 transition-[.3s] px-8 py-3 rounded-full font-bold text-base h-12 min-w-[100px] ${
            isMobile ? 'justify-start ' : ''
          }`}
        >
          Log in
        </Button>
      </div>

      <LoginModal
        open={loginOpen}
        onSuccess={setLoginOpen}
        onSwitchToSignUp={openSignUp}
      />

      <SignUpModal
        open={signUpOpen}
        onOpenChange={setSignUpOpen}
        onSwitchToLogin={openLogin}
      />
    </>
  )
}
