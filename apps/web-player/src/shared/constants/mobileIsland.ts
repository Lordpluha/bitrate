/**
 * Bottom padding that keeps content clear of the floating mobile island (`widgets/MobileIsland`):
 * its 66px height, its 18px offset above the safe area, a 16px breath, and the device's
 * home-indicator inset. The island is hidden from `xl` up, so reset it there.
 */
export const MOBILE_ISLAND_CLEARANCE_CLASS =
  'pb-[calc(6.25rem+env(safe-area-inset-bottom))]'
