export type SortDirection = 'asc' | 'desc'

/**
 * One column and the direction an operator list is ordered by. `TField` is the resource's own
 * sortable-column union, declared next to its filter type and bound to the contract's `sort`
 * query parameter in that resource's infrastructure mapper.
 */
export type Sort<TField extends string> = {
  field: TField
  direction: SortDirection
}
