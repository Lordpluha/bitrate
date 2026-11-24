// Every artist page shows its phone frame in all three themes, like its desktop frame: writePage places
// the Dark phone after the desktops, and these extras follow it as Mobile / Light and Mobile / Dim.
// States stay once each, in Dark.

const THEMES = ['Light', 'Dim']

/** Returns `spec` with Light and Dim editions of its phone frame (`spec.mobile(theme)`). */
export function themedMobile(spec) {
  if (!spec.mobile) return spec
  return {
    ...spec,
    extra: [
      ...THEMES.map((theme) => [`Mobile / ${theme}`, () => spec.mobile(theme), theme]),
      ...(spec.extra ?? []),
    ],
  }
}
