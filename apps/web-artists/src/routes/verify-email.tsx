import { VerifyEmailForm } from '@features/verify-email/ui/VerifyEmailForm'
import { getLoginDestination } from '@shared/routes/authRedirect'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  token: z.string().trim().min(1).max(512).optional().catch(undefined),
  email: z.email().optional().catch(undefined),
  next: z.string().optional().catch(undefined),
})

interface VerifyEmailSearch {
  token?: string
  email?: string
  next?: string
}

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => {
    const { token, email, next } = searchSchema.parse(search)
    return { token, email, next: next ? getLoginDestination(next) : undefined }
  },
  head: () => ({ meta: [{ name: 'referrer', content: 'no-referrer' }] }),
  component: VerifyEmailPage,
})

function VerifyEmailPage() {
  const { token, email, next } = Route.useSearch()
  return (
    <main className="min-h-screen flex items-center justify-center bg-black-800 p-6 text-white">
      <VerifyEmailForm
        email={email}
        key={`${token ?? ''}:${email ?? ''}`}
        next={next}
        token={token}
      />
    </main>
  )
}
