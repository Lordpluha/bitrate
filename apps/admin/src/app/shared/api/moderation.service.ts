import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { API_BASE_URL } from './api.config'
import {
  type ModerationReport,
  moderationReportPageSchema,
  type ModerationReportPage,
  type ModerationStatus,
  moderationReportSchema,
} from './schemas'

type ListReportsInput = {
  status?: ModerationStatus
  page?: number
  limit?: number
}

type UpdateReportInput = {
  id: string
  status: ModerationStatus
}

@Injectable({ providedIn: 'root' })
export class ModerationService {
  private readonly http = inject(HttpClient)
  private readonly base = `${API_BASE_URL}/api/v1/admin/moderation/reports`

  async list({ status, page = 1, limit = 20 }: ListReportsInput): Promise<ModerationReportPage> {
    const params: Record<string, string> = { page: String(page), limit: String(limit) }
    if (status) params['status'] = status

    const response = await firstValueFrom(this.http.get<unknown>(this.base, { params }))

    return moderationReportPageSchema.parse(response)
  }

  async updateStatus({ id, status }: UpdateReportInput): Promise<ModerationReport> {
    const response = await firstValueFrom(
      this.http.patch<unknown>(`${this.base}/${id}`, { status }),
    )

    return moderationReportSchema.parse(response)
  }
}
