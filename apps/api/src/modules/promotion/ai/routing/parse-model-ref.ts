import { PromotionModelConfigError } from './promotion-model-config.error'
import { APPROVED_PROVIDERS, type ApprovedProvider, type ModelRef } from './promotion-tasks'

const isApproved = (provider: string): provider is ApprovedProvider =>
  (APPROVED_PROVIDERS as readonly string[]).includes(provider)

/** Parses and checks one `provider:model` id against the approved providers. */
export function parseModelRef(id: string): ModelRef {
  const trimmed = id.trim()
  const separator = trimmed.indexOf(':')
  const provider = trimmed.slice(0, separator)
  const modelId = trimmed.slice(separator + 1).trim()
  if (separator <= 0 || modelId === '') {
    throw new PromotionModelConfigError(`Model id "${id}" must look like "provider:model"`)
  }
  if (!isApproved(provider)) {
    throw new PromotionModelConfigError(
      `Provider "${provider}" is not approved for promotion (allowed: ${APPROVED_PROVIDERS.join(', ')})`,
    )
  }
  return { id: trimmed, provider, modelId }
}
