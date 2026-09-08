import { RegistrationView } from '@views/RegistrationView'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/registration')({
  component: RegistrationPage,
})

function RegistrationPage() {
  return <RegistrationView />
}
