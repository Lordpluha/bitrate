// A page spec for writePage (kit.mjs) on the public frames: the desktop page in Dark, Light and Dim,
// the phone page, then every state as a desktop + phone pair.

/**
 * `meta` holds title, route, context and the frame options (`layout`); `build(m, theme)` returns the
 * content (`m` is true on a phone); each state is `[label, build, layout?, only?]`, where
 * `only = { side: 'desktop' | 'mobile', reason }` draws a state that exists on one side only.
 */
export function publicSpec(frames, meta, build, states = []) {
  const { layout = {}, ...rest } = meta
  return {
    ...rest,
    desktop: (theme) => frames.desktop(build(false, theme), layout),
    mobile: () => frames.mobile(build(true, 'Dark'), layout),
    states: states.map(([label, stateBuild, stateLayout = layout, only]) => ({
      label,
      reason: only?.reason,
      desktop:
        only?.side === 'mobile' ? undefined : () => frames.desktop(stateBuild(false), stateLayout),
      mobile:
        only?.side === 'desktop' ? undefined : () => frames.mobile(stateBuild(true), stateLayout),
    })),
  }
}
