import { LogoIconSm } from '@shared/ui'
import { Typography } from '@spotify/ui'
import Link from 'next/link'
import React from 'react'

export const RegistrationFormInfo = () => {
  return (
    <div className='flex flex-col items-center'>
        <LogoIconSm className='mb-4' />
        <Typography.Heading5>
          Create your account for free and start listening
        </Typography.Heading5>
        <Typography.Paragraph className='text-center text-greyLight'>
          By clicking on sign-up, you agree to the <br />
          <Link
            className='text-greenMain hover:opacity-70'
            href={'#'}
          >
            Spotify Terms and Conditions
          </Link>{' '}
          and{' '}
          <Link
            className='text-greenMain hover:opacity-70'
            href={'#'}
          >
            Privacy Policy{' '}
          </Link>
          .
        </Typography.Paragraph>
      </div>
  )
}
