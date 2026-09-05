'use client'

import { LogoIcon, Typography } from '@bitrate/ui-react'
import { useRegistrationForm } from '../model/useRegistrationForm'
import { RegistrationEmailStep } from './RegistrationEmailStep'
import { RegistrationPasswordStep } from './RegistrationPasswordStep'

/** Logo size in the card header. */
const LOGO_SIZE = 64

/** Two-step artist sign-up card: email address, then password. */
export const RegistrationForm = () => {
  const {
    backToEmailStep,
    form,
    isPending,
    passwordRules,
    step,
    submitEmail,
    submitPassword,
  } = useRegistrationForm()

  return (
    <div className="w-full max-w-120 flex flex-col items-stretch justify-center gap-4 px-14 py-20 bg-inherit text-white overflow-hidden rounded-[10px] max-lg:p-6 box-border">
      <div className="flex flex-col items-center mb-6">
        <LogoIcon height={LOGO_SIZE} width={LOGO_SIZE} />
        {step === 'email' ? (
          <Typography as="h5" className="mt-2 text-center" size={'heading2'}>
            Sign up and immerse yourself in music
          </Typography>
        ) : null}
      </div>

      {step === 'email' ? (
        <RegistrationEmailStep
          form={form}
          onSubmit={form.handleSubmit(submitEmail)}
        />
      ) : (
        <RegistrationPasswordStep
          form={form}
          isPending={isPending}
          onBack={backToEmailStep}
          onSubmit={form.handleSubmit(submitPassword)}
          rules={passwordRules}
        />
      )}
    </div>
  )
}
