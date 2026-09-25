import { createFileRoute } from '@tanstack/react-router'
import { RegistrationView } from '@views/RegistrationView'

export const Route = createFileRoute('/registration')({
  component: RegistrationPage,
})

function RegistrationPage() {
  return <RegistrationView />
}
