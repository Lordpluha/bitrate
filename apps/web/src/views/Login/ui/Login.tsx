import React from 'react'
import { LoginForm } from '@features/Login'
import styles from '@features/GradientAnimation/animated-gradient.module.css'
import clsx from 'clsx'
import { LoginFormBanner } from '@features/Login/ui/LoginFormBanner'

export const Login = () => {
  return (
    <div className={clsx(styles.bgAnimatedGradient, 'py-28 h-full')}>
      <div className='container max-w-[1440px] flex mx-auto items-stretch relative'>
        <LoginForm />
        <LoginFormBanner />
      </div>
    </div>
  )
}
