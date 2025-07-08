export type ValidationError<T extends Record<string, unknown> = Record<string, unknown>> = {
	errors: {
		field: keyof T
		message: string
	}
}

export type DefaultErrorResponse = string

export type ErrorResponse = ValidationError | DefaultErrorResponse
