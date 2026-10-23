import { STORY_RENDERED } from 'storybook/internal/core-events'
import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

/** The channel invokes listeners with the event as `this`; composed refs' events carry a refId. */
interface ChannelEventContext {
  refId?: string
}

/**
 * Works around a race in the manager's ref state (Storybook 10.6): a composed ref's preview is
 * marked initialized on CURRENT_STORY_WAS_SET, but when the ref's index finishes loading at about
 * the same moment, `setRef` writes back a stale copy of the ref and drops the flag — the story
 * renders, yet the canvas keeps its loading overlay. It shows on cold deep links into the admin
 * ref, whose index is the largest. A rendered story proves the preview is up, so restore the flag.
 */
addons.register('bitrate/composed-ref-ready', (api) => {
  api.on(STORY_RENDERED, function (this: ChannelEventContext) {
    const { refId } = this
    // Unset rather than false: the flag is absent from the ref until the preview first reports.
    const ref = refId ? api.getRefs()[refId] : undefined
    if (refId && ref && !ref.previewInitialized) {
      void api.updateRef(refId, { previewInitialized: true })
    }
  })
})

/**
 * Storybook is published at ui.bitrate.me, so its chrome carries the product's identity rather
 * than the framework's default. The dark base matches the library, whose own default theme is
 * dark — a light manager around dark components reads as a rendering fault.
 */
addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Bitrate UI',
    brandUrl: 'https://bitrate.me',
    brandTarget: '_self',
  }),
})
