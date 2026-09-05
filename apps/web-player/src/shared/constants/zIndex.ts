/**
 * Named stacking-layer scale for overlay components (sheets, dropdown menus,
 * modals, popovers). Keep call sites on this scale instead of introducing a
 * one-off `z-[...]` value or an `!important` escape.
 */
export const Z_INDEX_CLASS = {
  mobileSheetBackdrop: 'z-[60]',
  mobileSheetContent: 'z-[65]',
  bottomNavigation: 'z-[70]',
  dropdownMenu: 'z-[80]',
  select: 'z-[110]',
  modal: 'z-[120]',
  popover: 'z-[130]',
} as const
