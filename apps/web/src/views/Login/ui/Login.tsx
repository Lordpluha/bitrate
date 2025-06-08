'use client'

import { useMutation } from '@shared/api'
import { Button } from '@spotify/ui'

export const Login = () => {
  const { mutate } = useMutation('post', '/auth/login')
  return (
    <>
      <div>Login Page</div>
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
    </>
  )
}
