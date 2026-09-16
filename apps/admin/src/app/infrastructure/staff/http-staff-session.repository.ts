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

  /**
   * Login answers 201 with **no body** — it only sets the two httpOnly cookies, which is what
   * `AuthLoginSwagger` on the API documents. So the signed-in operator is read back from `/me`
   * on the session those cookies just established. Parsing the login response instead threw a
   * ZodError on an empty body and surfaced as "Sign-in failed" for correct credentials, while
   * the cookies were already set — a reload let you straight in.
   */
  override async signIn(credentials: Credentials): Promise<Staff> {
    await firstValueFrom(
      this.http.post(`${this.base}/login`, signInBodyDto.parse(credentials), {
        withCredentials: true,
      }),
    )

    const staff = await this.currentStaff()
    if (!staff) throw new Error('Signed in, but the session could not be read back from /me')

    return staff
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
