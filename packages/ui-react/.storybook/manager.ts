import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

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
