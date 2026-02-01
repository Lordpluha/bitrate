import { InstallIcon } from '@spotify/ui-react'
import Link from 'next/link'
import React from 'react'

export const InstallBtn = () => {
  return (
    <Link
      className="flex items-center space-x-2 hover:opacity-70 transition-[.3s]"
      href="#"
    >
      <InstallIcon />
      <span className="text-sm">Install App</span>
    </Link>
  )
}
