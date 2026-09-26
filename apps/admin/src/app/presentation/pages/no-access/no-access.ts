import { Component } from '@angular/core'

/**
 * Where `requirePermission` sends an operator who cannot reach any of the five guarded
 * screens. Gated only by `requireStaffSession` — never by a permission — so it can never itself
 * be the target of another redirect loop.
 */
@Component({
  selector: 'app-no-access',
  templateUrl: './no-access.html',
})
export class NoAccessPage {}
