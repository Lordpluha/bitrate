import type { AppConfig } from '@common/config'
import { PROMOTION_TASKS, type PromotionModelConfig, type PromotionTask } from './promotion-tasks'

/** The env variables that name each task's model and its fallback. */
const MODEL_ENV = {
  plan: ['PROMOTION_MODEL_PLAN', 'PROMOTION_MODEL_PLAN_FALLBACK'],
  copy: ['PROMOTION_MODEL_COPY', 'PROMOTION_MODEL_COPY_FALLBACK'],
  translate: ['PROMOTION_MODEL_TRANSLATE', 'PROMOTION_MODEL_TRANSLATE_FALLBACK'],
  check: ['PROMOTION_MODEL_CHECK', 'PROMOTION_MODEL_CHECK_FALLBACK'],
} as const satisfies Record<PromotionTask, readonly [keyof AppConfig, keyof AppConfig]>

/** Reads the per-task model ids; an empty fallback means the task has none. */
export function readPromotionModelConfig(
  read: (key: keyof AppConfig) => unknown,
): PromotionModelConfig {
  const config = {} as PromotionModelConfig
  for (const task of PROMOTION_TASKS) {
    const [primary, fallback] = MODEL_ENV[task]
    const fallbackId = String(read(fallback) ?? '').trim()
    config[task] = { primary: String(read(primary)), fallback: fallbackId || undefined }
  }
  return config
}
