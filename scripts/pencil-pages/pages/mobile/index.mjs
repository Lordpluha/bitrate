// Native mobile app (apps/mobile) page specs: one file per screen under pencil/mobile-app-design/.
import { accountPages } from './auth-account.mjs'
import { signInPages } from './auth-sign-in.mjs'
import { homePage } from './home.mjs'
import { libraryPages } from './library.mjs'
import { nowPlayingPages } from './now-playing.mjs'
import { profilePage } from './profile.mjs'
import { searchPage } from './search.mjs'

export const mobilePages = {
  ...signInPages,
  ...accountPages,
  ...homePage,
  ...searchPage,
  ...libraryPages,
  ...profilePage,
  ...nowPlayingPages,
}
