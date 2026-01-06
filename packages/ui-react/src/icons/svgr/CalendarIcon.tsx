import type { SVGProps } from "react";
interface CalendarIconProps extends SVGProps<SVGSVGElement> {
  primaryColor?: string
}

export const CalendarIcon = ({ primaryColor = "var(--fg-color, currentcolor)", ...props }: CalendarIconProps) => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 58 58" aria-hidden="true" focusable="false" {...props}><path stroke={primaryColor} strokeWidth={1.25} d="m3.273.727 54 54a1.8 1.8 0 0 1-2.546 2.546l-4.564-4.564A8.96 8.96 0 0 1 45.2 54.2H12.8a9 9 0 0 1-9-9V12.8c0-1.834.549-3.54 1.491-4.963L.727 3.273A1.8 1.8 0 1 1 3.273.727ZM45.945 48.49 32.6 35.145V38a1.8 1.8 0 0 1-1.8 1.8H16.4a1.8 1.8 0 0 1-1.8-1.8V23.6a1.8 1.8 0 0 1 1.8-1.8h2.854l-3.6-3.6H9.2v26.1a4.5 4.5 0 0 0 4.5 4.5h30.6c.58 0 1.135-.11 1.645-.31ZM22.855 25.4H18.2v10.8H29v-4.655zM48.8 41.163V18.2H25.837L11.527 3.89A9 9 0 0 1 12.8 3.8h32.4a9 9 0 0 1 9 9v32.4q0 .648-.09 1.274z" /></svg>;