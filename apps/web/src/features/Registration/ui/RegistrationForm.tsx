'use client'

import React from 'react'
import { GoggleIcon } from '@shared/ui'
import { Button, Input, Label, Typography } from '@spotify/ui'
import Link from 'next/link'
import { SocialLoginDivider } from './SocialLoginDivider'
import { useForm } from 'react-hook-form'

export const RegistrationForm = () => {
  const { register, handleSubmit, formState: {errors} } = useForm({
    mode: 'onChange',
  })

  const onSubmit = (data: any) => {
    console.log(data)
  }

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={handleSubmit(onSubmit)}
    >
      <Label className='relative pb-6' htmlFor='fullName'>
        <p className='mb-2 text-xl font-normal'>Full Name</p>
        <Input
          type='text'
          placeholder='Full name'
          variant='forContrast'
          id='fullName'
          {...register('fullName', { required: 'This field is required', maxLength: {value: 20, message: 'Max length is 20 characters' }  })}
        ></Input>
        {errors.fullName && (
          <p className='text-sm text-red-500 mt-1 bottom-0 left-0'>{errors.fullName?.message as string}</p>
        )}
      </Label>
      <Label htmlFor='email'>
        <p className='mb-2 text-xl font-normal'>Email Address</p>
        <Input
          type='email'
          placeholder='Email Address'
          variant='forContrast'
          id='email'
          {...register('email', { required: 'This field is required' })}
        ></Input>
      </Label>
      <Label htmlFor='password'>
        <p className='mb-2 text-xl font-normal'>Password</p>
        <Input
          type='password'
          placeholder='Password'
          variant='forContrast'
          id='password'
          {...register('password', { required: 'This field is required' })}
        ></Input>
      </Label>
      <div className='flex flex-col items-stretch gap-4'>
        <Button
          variant='green'
          className='rounded'
          type='submit'
        >
          Register
        </Button>
        <SocialLoginDivider />
        <Button
          variant='forContrast'
          size='sm'
        >
          <GoggleIcon className='mr-2' />
          {/* !<-- поправить */}
          <Typography.Paragraph>Continue with Google</Typography.Paragraph>
        </Button>
        <p className='text-lg text-center'>
          Already have an account?{' '}
          <Link
            className='font-bold'
            href={'login'}
          >
            {' '}
            Log in.
          </Link>{' '}
        </p>
      </div>
    </form>
  )
}
