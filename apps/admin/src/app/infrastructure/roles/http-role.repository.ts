import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import {
  type CreateRoleInput,
  type PermissionCatalogueEntry,
  type Role,
  RoleRepository,
  type UpdateRoleInput,
} from '@domain/role'
import { ADMIN_API } from '../http/api.config'
import {
  createRoleBodyDto,
  roleDto,
  roleListDto,
  rolePermissionListDto,
  updateRoleBodyDto,
} from './role.dto'
import { toPermissionCatalogueEntry, toRole } from './role.mapper'
import { toRoleWriteError } from './to-role-write-error'

@Injectable()
export class HttpRoleRepository extends RoleRepository {
  private readonly http = inject(HttpClient)
  private readonly base = `${ADMIN_API}/roles`

  override async list(): Promise<Role[]> {
    const response = await firstValueFrom(this.http.get<unknown>(this.base))

    return roleListDto.parse(response).map(toRole)
  }

  override async get(id: string): Promise<Role> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/${id}`))

    return toRole(roleDto.parse(response))
  }

  override async create(input: CreateRoleInput): Promise<Role> {
    try {
      const body = createRoleBodyDto.parse(input)
      const response = await firstValueFrom(this.http.post<unknown>(this.base, body))

      return toRole(roleDto.parse(response))
    } catch (error) {
      throw toRoleWriteError(error, 'create')
    }
  }

  override async update({ id, ...rest }: UpdateRoleInput): Promise<Role> {
    try {
      const body = updateRoleBodyDto.parse(rest)
      const response = await firstValueFrom(this.http.patch<unknown>(`${this.base}/${id}`, body))

      return toRole(roleDto.parse(response))
    } catch (error) {
      throw toRoleWriteError(error, 'update')
    }
  }

  override async delete(id: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${this.base}/${id}`))
    } catch (error) {
      throw toRoleWriteError(error, 'delete')
    }
  }

  override async listPermissionCatalogue(): Promise<PermissionCatalogueEntry[]> {
    const response = await firstValueFrom(this.http.get<unknown>(`${this.base}/permissions`))

    return rolePermissionListDto.parse(response).map(toPermissionCatalogueEntry)
  }
}
