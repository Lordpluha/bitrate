/** "or" between the email form and social sign-in. */
export const AuthOrDivider = () => (
  <div aria-hidden="true" className="flex items-center gap-3">
    <span className="h-px flex-1 bg-border" />
    <span className="text-[13px] text-muted-foreground">or</span>
    <span className="h-px flex-1 bg-border" />
  </div>
)
