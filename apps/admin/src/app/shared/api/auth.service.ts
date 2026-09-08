import { HttpClient } from '@angular/common/http'
import { computed, inject, Injectable, signal } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { API_BASE_URL } from './api.config'
import { type LoginRequest, type Staff, staffSchema } from './schemas'

/**
 * Session state for the signed-in operator. Deliberately not a cache: every read hits the API,
 * because this app has no query cache by design (ADR-0035).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient)
  private readonly staff = signal<Staff | null>(null)

  readonly currentStaff = this.staff.asReadonly()
  readonly isAuthenticated = computed(() => this.staff() !== null)

  async login(credentials: LoginRequest): Promise<Staff> {
    const response = await firstValueFrom(
      this.http.post<unknown>(`${API_BASE_URL}/api/v1/admin/auth/login`, credentials, {
        withCredentials: true,
      }),
    )
    const parsed = staffSchema.parse(response)

    this.staff.set(parsed)
    return parsed
  }

  async loadCurrentStaff(): Promise<Staff | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<unknown>(`${API_BASE_URL}/api/v1/admin/auth/me`),
      )
      const parsed = staffSchema.parse(response)

      this.staff.set(parsed)
      return parsed
    } catch {
      this.staff.set(null)
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${API_BASE_URL}/api/v1/admin/auth/logout`, {}, { withCredentials: true }),
      )
    } finally {
      this.staff.set(null)
    }
  }
}
