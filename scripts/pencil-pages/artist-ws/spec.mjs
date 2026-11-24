// A page spec for writePage (kit.mjs): the desktop page in each theme (the sidebar's theme preference
// shows the theme), the phone page in the same themes, then every state as a desktop + phone pair.

/**
 * `build(m)` returns the content nodes (`m` is true on a phone); each state is
 * `[label, shell, build, only?]` with the shell options of `frames.desktop`; `only = { side:
 * 'desktop' | 'mobile', reason }` draws a state that exists on one side only.
 */
export function pageSpec(frames, meta, shell, build, states = []) {
  const desktop = (theme) => frames.desktop({ ...shell, theme }, build(false))
  return {
    ...meta,
    desktop,
    mobile: () => frames.mobile(build(true)),
    states: states.map(([label, stateShell, stateBuild, only]) => ({
      label,
      reason: only?.reason,
      desktop:
        only?.side === 'mobile' ? undefined : () => frames.desktop(stateShell, stateBuild(false)),
      mobile: only?.side === 'desktop' ? undefined : () => frames.mobile(stateBuild(true)),
    })),
  }
}
