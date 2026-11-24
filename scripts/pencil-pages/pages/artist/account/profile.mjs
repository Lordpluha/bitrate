// Artist / Profile (views/ProfileView): the public profile preview beside the profile form, then
// Compilations with "Create compilation"; loading, error, the form's validation and save results.
import { pageSpec } from '../../../artist-ws/spec.mjs'
import { pageSkeleton } from '../workspace/page-skeleton.mjs'
import { profileForm } from './profile-form.mjs'

/** The profile page spec. */
export function profilePage(ui, frames) {
  const { P, Btn } = ui
  const { pageHead } = frames
  const p = profileForm(ui)
  const shell = { nav: 'profile', crumb: 'Profile', action: 'Create release' }
  const head = () => pageHead('Profile', 'How listeners see you on Bitrate.')
  const skeleton = pageSkeleton(ui)
  const page = (m, o = {}) => [head(), ...p.editor(m, o), p.compilations()]
  return pageSpec(
    frames,
    {
      title: 'Artist / Profile',
      route: '/dashboard/profile',
      context:
        'The public artist page as listeners see it, edited in place; the preview shows unsaved changes.',
    },
    shell,
    (m) => page(m),
    [
      ['Saving', shell, (m) => page(m, { busy: true })],
      ['Saved', shell, (m) => page(m, { saved: true })],
      ['No bio yet', shell, (m) => page(m, { noBio: true })],
      [
        'Handle taken',
        shell,
        (m) =>
          page(m, {
            handle: 'nightsignal',
            handleError: 'This handle is already taken. Choose another one.',
            error: 'Check the highlighted fields, then try again.',
          }),
      ],
      [
        'Handle invalid',
        shell,
        (m) => page(m, { handle: 'ms', handleError: 'Use at least 3 characters.' }),
      ],
      [
        'Invalid image',
        shell,
        (m) =>
          page(m, {
            imageError: true,
            error: 'Choose a JPEG, PNG or WebP image up to 10 MB.',
          }),
      ],
      [
        'Changed elsewhere',
        shell,
        (m) =>
          page(m, {
            error:
              'Your profile changed since this page loaded. Your entries are kept; reload the page to see the latest version.',
          }),
      ],
      [
        'Not confirmed',
        shell,
        (m) =>
          page(m, {
            error: 'Could not confirm your profile was saved. Reload the page before trying again.',
          }),
      ],
      ['Loading', shell, (m) => [head(), ...skeleton(m)]],
      [
        'Error',
        shell,
        () => [
          head(),
          P('Body', 'Could not load your profile. Please try again.'),
          Btn('Try again', 'Outline'),
        ],
      ],
    ],
  )
}
