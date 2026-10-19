/** Hours (local, 0–23) at which the home greeting changes. */
const MORNING_FROM = 5
const AFTERNOON_FROM = 12
const EVENING_FROM = 18

type GreetingKey =
  | 'main.greeting.afternoon'
  | 'main.greeting.evening'
  | 'main.greeting.morning'

type GreetingKeyInput = {
  hour: number
}

/** The home heading's greeting for a local hour; the night counts as evening. */
export const greetingKey = ({ hour }: GreetingKeyInput): GreetingKey => {
  if (hour >= MORNING_FROM && hour < AFTERNOON_FROM)
    return 'main.greeting.morning'
  if (hour >= AFTERNOON_FROM && hour < EVENING_FROM)
    return 'main.greeting.afternoon'
  return 'main.greeting.evening'
}
