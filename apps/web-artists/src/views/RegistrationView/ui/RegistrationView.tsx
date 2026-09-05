import { RegistrationForm } from '@app/features/registration'

export const RegistrationView = () => {
  return (
    <div className="min-h-screen flex items-center bg-black-800">
      <div className="container max-w-360 flex mx-auto relative h-min justify-center text-white py-6">
        <RegistrationForm />
      </div>
    </div>
  )
}
