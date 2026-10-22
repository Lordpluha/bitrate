import { inject, Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router'

/** Appended to every route title, so each route declares only its own name. */
const TITLE_SUFFIX = ' · Bitrate operators'

/** Sets the tab title to the deepest route's `title` plus the panel's suffix. */
@Injectable()
export class OperatorTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title)

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot)
    if (title !== undefined) this.title.setTitle(`${title}${TITLE_SUFFIX}`)
  }
}
