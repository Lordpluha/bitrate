import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { type Credentials, type Staff, StaffSessionRepository } from '@domain/staff'
import { ADMIN_API } from '../http/api.config'
import { signInBodyDto, staffDto } from './staff.dto'
import { toStaff } from './staff.mapper'

@Injectable()
export class HttpStaffSessionRepository extends StaffSessionRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/auth`

  override async signIn(credentials: Credentials): Promise<Staff> {
    const response = await firstValueFrom(
      this.http.post<unknown>(`${this.base}/login`, signInBodyDto.parse(credentials), {
        withCredentials: true,
      }),
    )

    return toStaff(staffDto.parse(response))
  }

  /**
   * The session cookie is httpOnly, so asking the API is the only way to know whether it is
   * valid. A rejection is an answer here, not a failure — the port promises `null`, and the
   * guard redirects on it.
   */
  override async currentStaff(): Promise<Staff | null> {
    try {
      const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/me`))

      return toStaff(staffDto.parse(response))
    } catch {
      return null
    }
  }

  override async signOut(): Promise<void> {
    await firstValueFrom(this.http.post(`${this.base}/logout`, {}, { withCredentials: true }))
  }
}
