import { workspaceThemeScript } from './workspaceTheme'

export function WorkspaceThemeScript() {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: Static theme bootstrap must run before hydration; it contains no user input.
  return <script dangerouslySetInnerHTML={{ __html: workspaceThemeScript }} />
}
