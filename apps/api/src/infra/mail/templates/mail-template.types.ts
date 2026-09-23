/** A rendered transactional email, ready to hand to the transport. */
export type RenderedMail = {
  subject: string
  html: string
}

/** Parameters shared by the password-reset and email-verification templates. */
export type LinkMailParams = {
  username: string
  url: string
}
