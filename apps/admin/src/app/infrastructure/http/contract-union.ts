import { z } from 'zod'

/**
 * The `coveringTuple` guarantee, for a zod enum. `satisfies z.ZodType<T>` alone does not give it: a
 * narrower enum than the contract declares is still assignable, so a new API member passes the
 * type check and then throws inside `parse`, in front of an operator, as an empty screen.
 * @returns A function taking the members, which must cover the union.
 */
export function contractEnum<TUnion extends string>() {
  return <const TMembers extends readonly [TUnion, ...TUnion[]]>(
    members: [TUnion] extends [TMembers[number]] ? TMembers : never,
  ) => z.enum(members)
}
