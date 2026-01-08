import type { SVGProps } from "react";
interface RecentsIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const RecentsIcon = ({ primaryColor = "#b3b3b3", ...props }: RecentsIconProps) => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 17 17" aria-hidden="true" focusable="false" {...props}><path fill={primaryColor} d="M15.05 15.431H5.056v-1.499h9.994zm0-5.746H5.056v-1.5h9.994zm0-5.747H5.056V2.44h9.994zm-11.993 0H1.06V2.44h1.998zm0 11.493H1.06v-1.499h1.998zm0-5.746H1.06v-1.5h1.998z" /></svg>;