
import React from 'react'
import { RegistrationFormInfo } from './RegistrationFormInfo'
import { RegistrationForm } from './RegistrationForm'

export const RegistrationFormWrap: React.FC = () => {
  return (
    <div className='flex flex-col gap-6 items-stretch justify-center basis-[50%] p-14 bg-contrast text-textForContrast overflow-hidden rounded-[10px_0_0_10px]'>
      <RegistrationFormInfo/>
      <RegistrationForm/>
    </div>
  )
}
