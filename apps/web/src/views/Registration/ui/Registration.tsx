import React from 'react'
import { RegistrationForm, RegistrationFormBanner } from '@features/Registration'
import styles from '@features/GradientAnimation/animated-gradient.module.css'
import clsx from 'clsx'

export const Registration = () => {
  return (
    <div className={clsx(styles.bgAnimatedGradient, 'py-28 h-full')}>
      <div className='container max-w-[1440px] flex mx-auto items-stretch relative'>
        <RegistrationForm />
        <RegistrationFormBanner />
      </div>
    </div>
  )
}
