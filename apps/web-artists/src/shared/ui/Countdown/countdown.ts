export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/** Whole days, hours, minutes and seconds left until `target`; all zero once it has passed. */
export function countdownParts(target: number, now: number): CountdownParts {
  let left = Math.max(0, Math.floor((target - now) / 1000))
  const days = Math.floor(left / 86_400)
  left %= 86_400
  const hours = Math.floor(left / 3600)
  left %= 3600
  return { days, hours, minutes: Math.floor(left / 60), seconds: left % 60 }
}
