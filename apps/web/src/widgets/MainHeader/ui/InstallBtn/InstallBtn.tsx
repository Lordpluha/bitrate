// import { InstallIcon } from '@shared/ui'
import Link from 'next/link'
import React from 'react'

interface InstallBtnProps {
  isMobile?: boolean
}

export const InstallBtn = ({ isMobile = false }: InstallBtnProps) => {
  return (
    <Link
      className={`flex items-center space-x-2 hover:opacity-70 transition-[.3s] ${
        isMobile ? 'text-white py-2' : ''
      }`}
      href='#'
    >
      {/* <InstallIcon /> */}
      <span className='text-sm'>Install App</span>
    </Link>
  )
}
