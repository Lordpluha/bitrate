/** The landing focus ring on the element itself (buttons, pills, the assistant button). */
export const FOCUS_RING =
  '[&:focus-visible]:[outline:2px_solid_var(--accent)] [&:focus-visible]:[outline-offset:3px]'

/** The same ring on the buttons inside a group (theme switch, scene dots). */
export const BUTTON_FOCUS_RING =
  '[&_button:focus-visible]:[outline:2px_solid_var(--accent)] [&_button:focus-visible]:[outline-offset:3px]'
