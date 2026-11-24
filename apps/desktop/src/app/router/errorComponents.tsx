import AppError from '@app/error'
import MainError from '@app/main/error'
import type { ErrorComponentProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'

/** A route screen: rendered without props, params come from the route itself. */
export type ScreenComponent = () => ReactNode

/** The router hands over whatever was thrown; web-player's boundaries report an `Error`. */
const toError = (thrown: unknown): Error =>
  thrown instanceof Error ? thrown : new Error(String(thrown))

/** web-player's root `error.tsx`: the whole window failed to render. */
export const RootErrorComponent = ({ error, reset }: ErrorComponentProps) => (
  <AppError error={toError(error)} reset={reset} />
)

/** web-player's `main/error.tsx`: one screen failed; the shell and player keep running. */
export const ScreenErrorComponent = ({ error, reset }: ErrorComponentProps) => (
  <MainError error={toError(error)} reset={reset} />
)
