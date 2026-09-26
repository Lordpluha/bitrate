/**
 * Builds a tuple that must cover a union exactly, in whatever order the caller wants.
 *
 * Annotating a list `readonly Status[]` does not do this: a list missing a member is still
 * assignable, so a status the domain grows later type-checks cleanly and quietly disappears from
 * the filter strip. Stating the union here turns that into a compile error where the list is
 * written.
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
