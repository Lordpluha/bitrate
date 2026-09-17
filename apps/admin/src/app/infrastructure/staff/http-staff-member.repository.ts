import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import type { Page } from '@domain/shared'
import {
  type AssignStaffRoleInput,
  type CreateStaffInput,
  type ListStaffQuery,
  type StaffMember,
  StaffRepository,
  type UpdateStaffPermissionsInput,
} from '@domain/staff'
import { ADMIN_API } from '../http/api.config'
import { fetchPage } from '../http/wire-page'
import {
  assignStaffRoleBodyDto,
  createStaffBodyDto,
  staffMemberDto,
  staffMemberPageDto,
  updateStaffPermissionsBodyDto,
} from './staff-member.dto'
import { toStaffMember, toWireStaffSort } from './staff-member.mapper'
import { toStaffWriteError } from './to-staff-write-error'

/**
 * The operator **directory**, distinct from `HttpStaffSessionRepository` (`staff.dto.ts`),
 * which serves the signed-in operator's own session.
 */
@Injectable()
export class HttpStaffRepository extends StaffRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/staff`

  override list({ page, limit, filter = {} }: ListStaffQuery): Promise<Page<StaffMember>> {
    return fetchPage({
      http: this.http,
      url: this.base,
      page,
      limit,
      filters: {
        sort: filter.sort ? toWireStaffSort(filter.sort.field) : undefined,
        order: filter.sort?.direction,
      },
      schema: staffMemberPageDto,
      toDomain: toStaffMember,
    })
  }

  override async get(id: string): Promise<StaffMember> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))

    return toStaffMember(staffMemberDto.parse(response))
  }

  override async create(input: CreateStaffInput): Promise<StaffMember> {
    try {
      const body = createStaffBodyDto.parse(input)
      const response = await firstValueFrom(this.http.post<unknown>(this.base, body))

      return toStaffMember(staffMemberDto.parse(response))
    } catch (error) {
      throw toStaffWriteError(error, 'create')
    }
  }

  override async assignRole({ id, ...rest }: AssignStaffRoleInput): Promise<StaffMember> {
    try {
      const body = assignStaffRoleBodyDto.parse(rest)
      const response = await firstValueFrom(
        this.http.patch<unknown>(`${this.base}/${id}/role`, body),
      )

      return toStaffMember(staffMemberDto.parse(response))
    } catch (error) {
      throw toStaffWriteError(error, 'assign-role')
    }
  }

  override async updatePermissions({
    id,
    permissions,
  }: UpdateStaffPermissionsInput): Promise<StaffMember> {
    try {
      const body = updateStaffPermissionsBodyDto.parse({ permissions })
      const response = await firstValueFrom(
        this.http.patch<unknown>(`${this.base}/${id}/permissions`, body),
      )

      return toStaffMember(staffMemberDto.parse(response))
    } catch (error) {
      throw toStaffWriteError(error, 'update-permissions')
    }
  }

  override async deactivate(id: string): Promise<StaffMember> {
    try {
      const response = await firstValueFrom(this.http.delete<unknown>(`${this.base}/${id}`))

      return toStaffMember(staffMemberDto.parse(response))
    } catch (error) {
      throw toStaffWriteError(error, 'deactivate')
    }
  }
}
