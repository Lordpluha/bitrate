# Validation

This module contains reusable validation schemas for application forms, built on top of Zod.

## Structure

### Basic Validators
- `emailSchema` - email address validation
- `passwordSchema` - full password validation (for registration)
- `loginPasswordSchema` - simplified password validation (for login)
- `fullNameSchema` - full name validation

### Ready-to-use Form Schemas
- `loginSchema` - schema for login form
- `registrationSchema` - schema for registration form

### Types
- `LoginFormData` - login form data type
- `RegistrationFormData` - registration form data type

## Usage

```typescript
import { loginSchema, LoginFormData } from '@shared/validation'

// In form component
const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  // ...
})
```

## Benefits

1. **Reusability**: Same validators are used across different forms
2. **Consistency**: All forms use the same validation rules
3. **Centralization**: All validation rules in one place
4. **Type Safety**: TypeScript types are automatically generated from schemas
