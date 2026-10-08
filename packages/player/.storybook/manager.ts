import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

/** Same chrome as the ui-react Storybook, so the two catalogues read as one product. */
addons.setConfig({
  theme: create({
    base: 'dark',
    brandTitle: 'Bitrate Player',
    brandUrl: 'https://bitrate.me',
    brandTarget: '_self',
  }),
})
