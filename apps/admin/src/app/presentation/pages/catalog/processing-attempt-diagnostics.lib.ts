import type { ProcessingAttempt } from '@domain/track'

/** The plain-text payload written to the clipboard by an attempt's "Copy diagnostics" action. */
export function buildDiagnosticsText(attempt: ProcessingAttempt): string {
  const lines: string[] = [
    `Attempt ${attempt.attempt} of ${attempt.maxAttempts} — ${attempt.status}`,
  ]

  if (attempt.commandSummary) lines.push(`Command: ${attempt.commandSummary}`)
  if (attempt.errorMessage) lines.push(`Error: ${attempt.errorMessage}`)
  if (attempt.stderrTail) lines.push(`stderr:\n${attempt.stderrTail}`)
  if (attempt.errorStack) lines.push(`Stack:\n${attempt.errorStack}`)

  return lines.join('\n\n')
}
