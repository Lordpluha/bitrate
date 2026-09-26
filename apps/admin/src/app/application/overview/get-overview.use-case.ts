import { inject, Injectable } from '@angular/core'
import { type Overview, OverviewRepository } from '@domain/overview'

@Injectable({ providedIn: 'root' })
export class GetOverviewUseCase {
  private readonly overview = inject(OverviewRepository)

  execute(): Promise<Overview> {
    return this.overview.get()
  }
}
