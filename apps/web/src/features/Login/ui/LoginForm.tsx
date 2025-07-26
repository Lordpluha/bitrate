'use client'

import { Button, Input } from '@spotify/ui'
import { useMutation } from '@shared/api'
import React from 'react'
import { Registration } from '@views/Registration'

export const LoginForm = () => {
  const { mutate } = useMutation('post', '/auth/login')
  return (
    <div>
      LoginForm
      <Input />
      <Registration />
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
