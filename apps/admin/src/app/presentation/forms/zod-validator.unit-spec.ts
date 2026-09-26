import { FormControl, FormGroup, Validators } from '@angular/forms'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { zodErrorMessage, zodValidator } from './zod-validator'

const schema = z
  .object({
    email: z.string().min(1, 'Email is required').pipe(z.email('Enter a valid email address')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((value) => value.password === value.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })

function buildForm(): FormGroup {
  return new FormGroup(
    {
      email: new FormControl('', { nonNullable: true }),
      password: new FormControl('', { nonNullable: true }),
      confirm: new FormControl('', { nonNullable: true }),
    },
    { validators: zodValidator(schema) },
  )
}

describe('zodValidator', () => {
  it('accepts a value the schema accepts', () => {
    const form = buildForm()
    form.setValue({
      email: 'operator@bitrate.me',
      password: 'correct-horse',
      confirm: 'correct-horse',
    })

    expect(form.valid).toBe(true)
    expect(zodErrorMessage(form.get('email'))).toBeNull()
  })

  it('puts each issue on the control its path names', () => {
    const form = buildForm()
    form.setValue({ email: '', password: 'short', confirm: 'short' })

    expect(zodErrorMessage(form.get('email'))).toBe('Email is required')
    expect(zodErrorMessage(form.get('password'))).toBe('Password must be at least 8 characters')
    expect(form.valid).toBe(false)
  })

  /** The whole reason the validator sits on the group rather than on each control. */
  it('reports a cross-field rule on the control its path names', () => {
    const form = buildForm()
    form.setValue({
      email: 'operator@bitrate.me',
      password: 'correct-horse',
      confirm: 'wrong-horse',
    })

    expect(zodErrorMessage(form.get('confirm'))).toBe('Passwords do not match')
  })

  it('clears its own errors once the value becomes valid', () => {
    const form = buildForm()
    form.setValue({ email: '', password: 'short', confirm: 'short' })
    expect(zodErrorMessage(form.get('email'))).toBe('Email is required')

    form.setValue({
      email: 'operator@bitrate.me',
      password: 'correct-horse',
      confirm: 'correct-horse',
    })

    expect(zodErrorMessage(form.get('email'))).toBeNull()
    expect(form.get('email')?.errors).toBeNull()
    expect(form.valid).toBe(true)
  })

  /**
   * The validator clears only its own key. A control's own validators must survive, both while
   * the schema is failing and after it starts passing.
   *
   * Note this uses a real `ValidatorFn` rather than a manual `setErrors`: Angular recomputes a
   * control's errors from its validators on every `setValue`, so a hand-placed error would be
   * discarded by the framework before this validator ever ran.
   */
  it('leaves errors from a control-level validator alone', () => {
    const form = new FormGroup(
      {
        email: new FormControl('', {
          nonNullable: true,
          validators: Validators.maxLength(5),
        }),
        password: new FormControl('', { nonNullable: true }),
        confirm: new FormControl('', { nonNullable: true }),
      },
      { validators: zodValidator(schema) },
    )

    form.setValue({
      email: 'operator@bitrate.me',
      password: 'correct-horse',
      confirm: 'correct-horse',
    })

    const email = form.get('email')
    expect(email?.errors?.['maxlength']).toBeTruthy()
    expect(zodErrorMessage(email)).toBeNull()
    expect(form.valid).toBe(false)
  })

  it('reports the first issue per field rather than piling them up', () => {
    const form = buildForm()
    form.setValue({ email: 'not-an-email', password: 'short', confirm: 'short' })

    const message = zodErrorMessage(form.get('email'))
    expect(message).toBe('Enter a valid email address')
  })
})
