import { api } from '@/lib/api/client'

/** `POST /auth/logout`. Best effort: the local session is cleared even if the call fails. */
export async function logOut(): Promise<void> {
  try {
    await api.POST('/api/v1/auth/logout')
  } catch {
    // Offline or already expired — the caller still drops the local session.
  }
}
