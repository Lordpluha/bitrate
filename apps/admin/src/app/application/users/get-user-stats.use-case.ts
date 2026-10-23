import { inject, Injectable } from '@angular/core'
import { countByResourceStatus, type ResourceCounts } from '@application/shared'
import { UserRepository } from '@domain/user'

/** Active and deactivated listeners, for the KPI strip above the listeners list. */
@Injectable({ providedIn: 'root' })
export class GetUserStatsUseCase {
  private readonly users = inject(UserRepository)

  execute(): Promise<ResourceCounts> {
    return countByResourceStatus((query) => this.users.list(query))
  }
}
