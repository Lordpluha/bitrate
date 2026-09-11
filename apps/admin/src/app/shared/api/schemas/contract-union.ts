import { z } from 'zod'

/**
 * Builds a tuple that must cover a contract's literal union exactly, in whatever order the
 * caller wants.
 *
 * Annotating the list `readonly Status[]` does not do this: a list missing a member is still
 * assignable, so a status the API grows later type-checks cleanly and quietly disappears from
 * the UI. Stating the union here turns that into a compile error where the list is written.
 *
 * Curried because TypeScript infers all type arguments or none — the union is stated, the tuple
 * is inferred.
 * @returns A function taking the members, which must cover the union.
 */
export function coveringTuple<TUnion extends string>() {
  return <const TMembers extends readonly [TUnion, ...TUnion[]]>(
    members: [TUnion] extends [TMembers[number]] ? TMembers : never,
  ) => members
}

/**
 * The same guarantee for a zod enum. `satisfies z.ZodType<T>` alone does not give it: a
 * narrower enum than the contract declares is still assignable, so a new API member passes the
 * type check and then throws inside `parse`, in front of an operator, as an empty screen.
 * @returns A function taking the members, which must cover the union.
 */
export function contractEnum<TUnion extends string>() {
  return <const TMembers extends readonly [TUnion, ...TUnion[]]>(
    members: [TUnion] extends [TMembers[number]] ? TMembers : never,
  ) => z.enum(members)
}
