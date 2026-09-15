import { Component, inject, signal } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { SignInUseCase } from '@application/session'
import { zodErrorMessage, zodValidator } from '@presentation/forms'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmLabelImports } from '@spartan-ng/helm/label'
import { credentialsSchema } from './credentials.schema'

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, HlmButtonImports, HlmInputImports, HlmLabelImports],
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly signIn = inject(SignInUseCase)
  private readonly router = inject(Router)

  protected readonly submitting = signal(false)
  protected readonly failure = signal<string | null>(null)

  protected readonly form = new FormGroup(
    {
      email: new FormControl('', { nonNullable: true }),
      password: new FormControl('', { nonNullable: true }),
    },
    { validators: zodValidator(credentialsSchema) },
  )

  protected errorFor(field: 'email' | 'password'): string | null {
    const control = this.form.get(field)
    if (!control || !control.touched) return null

    return zodErrorMessage(control)
  }

  protected async submit(): Promise<void> {
    this.form.markAllAsTouched()
    this.failure.set(null)

    if (this.form.invalid || this.submitting()) return

    this.submitting.set(true)
    try {
      await this.signIn.execute(this.form.getRawValue())
      await this.router.navigate(['/moderation'])
    } catch {
      this.failure.set('Sign-in failed. Check the address and password, then try again.')
    } finally {
      this.submitting.set(false)
    }
  }
}
