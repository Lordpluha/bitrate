'use client'

import { useMutation } from '@shared/api'
import { Button } from '@spotify/ui/components/ui/button'

export const Login = () => {
  const { mutate } = useMutation('post', '/auth/login')
  return (
    <>
      <div>Login Page</div>
      <Button
        variant={'outline'}
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
