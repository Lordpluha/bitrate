import { inject, Injectable } from '@angular/core'
import { type UserDetail, UserRepository } from '@domain/user'

@Injectable({ providedIn: 'root' })
export class GetUserUseCase {
  private readonly users = inject(UserRepository)

  execute(id: string): Promise<UserDetail> {
    return this.users.getById(id)
  }
}
