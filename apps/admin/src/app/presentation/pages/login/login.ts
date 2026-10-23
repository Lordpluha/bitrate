import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { SignInUseCase } from '@application/session'
import { TranslocoPipe } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideArrowRight, lucideCircleAlert, lucideLoader2 } from '@ng-icons/lucide'
import { zodErrorMessage, zodValidator } from '@presentation/forms'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { credentialsSchema } from './credentials.schema'

@Component({
  selector: 'app-login',
  imports: [
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    NgIcon,
    ReactiveFormsModule,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideArrowRight, lucideCircleAlert, lucideLoader2 })],
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly signIn = inject(SignInUseCase)
  private readonly router = inject(Router)

  protected readonly submitting = signal(false)
  /** Whether the last attempt was refused — the page words it, so the language can change. */
  protected readonly failed = signal(false)

  protected readonly form = new FormGroup(
    {
      email: new FormControl('', { nonNullable: true }),
      password: new FormControl('', { nonNullable: true }),
    },
    { validators: zodValidator(credentialsSchema) },
  )

  /** The field's error as a transloco key, once the operator has touched it. */
  protected errorFor(field: 'email' | 'password'): string | null {
    const control = this.form.get(field)
    if (!control || !control.touched) return null

    return zodErrorMessage(control)
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched()
    this.failed.set(false)

    if (this.form.invalid || this.submitting()) return

    this.submitting.set(true)
    try {
      await this.signIn.execute(this.form.getRawValue())
      /**
       * `/` — the guarded root, `overview:read` — not a fixed screen: `requirePermission`
       * sends an operator without that permission on to their first reachable route.
       */
      await this.router.navigate(['/'])
    } catch {
      this.failed.set(true)
    } finally {
      this.submitting.set(false)
    }
  }
}
