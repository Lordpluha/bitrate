import { faker } from '@faker-js/faker'

/** Longest username the seeder will generate from an artist name. */
const MAX_USERNAME_LENGTH = 50

/** Turns an arbitrary artist name into a URL-safe username. */
export function sanitizeUsername(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, MAX_USERNAME_LENGTH)
}

/** Picks between `min` and `max` random items, never asking for more than exist. */
export function sample<T>(items: T[], min: number, max: number): T[] {
  if (items.length === 0) return []

  const count = Math.min(items.length, faker.number.int({ min: Math.min(min, items.length), max }))
  return faker.helpers.arrayElements(items, count)
}
