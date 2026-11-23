import type { KnowledgeAudience } from '../domain.js'
import { isAudience } from './is-audience.js'

export function isKnowledgeAudience(value: string): value is KnowledgeAudience {
  return value === 'all' || isAudience(value)
}
