'use client'

import { useMutation } from '@shared/api'
import { Button } from '@spotify/ui'
import React from 'react'

export const LoginForm = () => {
  const { mutate } = useMutation('post', '/auth/login')
  return (
    <div>
      LoginForm
      <Button
        variant='destructive'
        className='rounded'
        onClick={() =>
          mutate({
            body: {
              username: 'admin',
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
