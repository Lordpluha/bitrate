import { LoginForm } from '@app/features/login'

export const LoginView = () => {
  return (
    <div className="min-h-screen flex items-center bg-black-800">
      <div className="container max-w-360 flex mx-auto relative h-min justify-center text-white py-6">
        <LoginForm />
      </div>
    </div>
  )
}
