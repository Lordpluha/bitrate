'use client'

import { Button } from '@spotify/ui'
import React, { useState } from 'react'
import { LoginModal, SignUpModal } from '@features/AuthModal'
import { Ghost } from 'lucide-react'

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
      <div className='flex items-center gap-8'>
        <Button
          onClick={openSignUp}
          variant="ghost"
          className='hover:opacity-70 transition-[.3s] text-base font-semibold text-white'
        >
          Sign up
        </Button>

        <Button
          onClick={openLogin}
          variant="default"
          className='bg-white text-black hover:bg-grey-400 hover:opacity-70 transition-[.3s] px-8 py-3 rounded-full font-bold text-base h-12 min-w-[100px]'
        >
          Log in
        </Button>
      </div>

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
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
