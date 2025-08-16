'use client'

import { Button, Input } from '@spotify/ui'
import { useMutation } from '@shared/api'
import React from 'react'

export const LoginForm = () => {
  const { mutate } = useMutation('post', '/auth/login')

  return (
    <div>
      LoginForm
      <Input />
      <Button
        variant='destructive'
        className='rounded'
        onClick={() =>
          mutate({
            body: {
              email: 'admin',
              password: 'admin'
            }
          })
        }
      >
        Login
      </Button>
    </div>
  )
}
