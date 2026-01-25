import type { SVGProps } from "react"

interface PasswordCheckProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
  secondaryColor?: string
}

export const PasswordCheck = ({
  primaryColor = "#000000",
  secondaryColor = "#ffffff",
  ...props
}: PasswordCheckProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 21 22"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <g
      fill={primaryColor}
      clipPath="url(#Dweb-programmingspotifyspotify-clonepackagestokensiconspassword-check-a)"
    >
      <path d="M20.872 10.775c-.157-.274-3.91-6.718-10.372-6.718S.285 10.501.128 10.775L0 11l.128.224c.157.274 3.91 6.719 10.372 6.719s10.215-6.445 10.372-6.719L21 11zM10.5 17.07c-5.33 0-8.798-4.946-9.517-6.07.719-1.122 4.187-6.068 9.517-6.068S19.298 9.877 20.017 11c-.719 1.123-4.187 6.069-9.517 6.069" />
      <path d="M10.5 6.238c-2.507 0-4.546 2.136-4.546 4.762s2.04 4.762 4.546 4.762 4.546-2.136 4.546-4.762-2.04-4.762-4.546-4.762m0 8.65c-2.046 0-3.711-1.744-3.711-3.888S8.453 7.112 10.5 7.112 14.212 8.856 14.212 11s-1.665 3.888-3.712 3.888" />
      <path d="M10.5 9.209c-.942 0-1.709.803-1.709 1.79 0 .988.767 1.791 1.71 1.791.942 0 1.709-.803 1.709-1.79 0-.988-.767-1.791-1.71-1.791m0 2.707c-.482 0-.874-.41-.874-.916s.392-.917.874-.917c.483 0 .875.411.875.917 0 .505-.392.916-.875.916" />
    </g>
    <defs>
      <clipPath id="Dweb-programmingspotifyspotify-clonepackagestokensiconspassword-check-a">
        <path fill={secondaryColor} d="M0 0h21v22H0z" />
      </clipPath>
    </defs>
  </svg>
)
