// A page spec for writePage (kit.mjs): the desktop page in each theme (the sidebar's theme preference
// shows the theme), the phone page, then every state as a desktop + phone pair.

/**
 * `build(m)` returns the content nodes (`m` is true on a phone); each state is
 * `[label, shell, build]` with the shell options of `frames.desktop`.
 */
export function pageSpec(frames, meta, shell, build, states = []) {
  const desktop = (theme) => frames.desktop({ ...shell, theme }, build(false))
  return {
    ...meta,
    desktop,
    mobile: () => frames.mobile(build(true)),
    states: states.map(([label, stateShell, stateBuild]) => ({
      label,
      desktop: () => frames.desktop(stateShell, stateBuild(false)),
      mobile: () => frames.mobile(stateBuild(true)),
    })),
  }
}
