import z from "zod";

export const passwordSchema = z
	.string()
	.min(8, 'Password must be at least 8 characters')
	.refine((val) => /[a-z]/.test(val), {
		message: 'Password must include at least one lowercase letter',
	})
	.refine((val) => /[A-Z]/.test(val), {
		message: 'Password must include at least one uppercase letter',
	})
	.refine((val) => /\d/.test(val), {
		message: 'Password must include at least one number',
	})
	.refine((val) => /[@$!%*?&]/.test(val), {
		message: 'Password must include at least one special character',
	})