/**
 * What a deactivate, restore, or revoke-sessions write sends. `reason` is optional and, when
 * present, is already trimmed and non-empty — an empty reason is never sent as an empty string,
 * it is simply omitted.
 */
export type TakeDownInput = {
  id: string
  reason?: string
}
