import { flushSync } from 'react-dom'
import { motionReduced } from './motion'

// Only user actions in the browser use this coordinator; SSR and initial preferences stay instant.
let active: ViewTransition | undefined
let revision = 0

/** Capture both React commits so colours, gradients and translated text fade together. */
export function transitionPreference(
  kind: 'theme' | 'language',
  update: () => void,
) {
  const currentRevision = ++revision
  active?.skipTransition()
  active = undefined

  if (
    typeof document === 'undefined' ||
    typeof document.startViewTransition !== 'function' ||
    motionReduced()
  ) {
    if (typeof document !== 'undefined')
      delete document.documentElement.dataset.preferenceTransition
    update()
    return
  }

  const root = document.documentElement
  root.dataset.preferenceTransition = kind
  const transition = document.startViewTransition(() => {
    // Skipping an animation still runs its callback. A newer choice must win.
    if (currentRevision === revision) flushSync(update)
  })
  active = transition
  // A new click or navigation can skip the snapshot without cancelling the preference change.
  void transition.ready.catch(() => {})
  void transition.finished
    .catch(() => {})
    .then(() => {
      if (active !== transition) return
      active = undefined
      delete root.dataset.preferenceTransition
    })
}
