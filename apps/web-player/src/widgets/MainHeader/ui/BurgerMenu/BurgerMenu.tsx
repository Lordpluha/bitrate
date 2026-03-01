'use client'

import { cn } from '@spotify/ui-react'
import { Menu, X } from 'lucide-react'
import React, { useState } from 'react'
import { AuthButtons } from '../AuthButtons'
import { InstallBtn } from '../InstallBtn'
import { NavLinks } from '../NavLinks'

export const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button
        aria-label="Toggle menu"
        className="p-2 text-white hover:opacity-70 transition-opacity"
        onClick={toggleMenu}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full bg-black border-l border-gray-800 z-50 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-white text-lg font-semibold">Menu</h2>
            <button
              className="p-2 text-white hover:opacity-70 transition-opacity"
              onClick={closeMenu}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-6">
              <div className="flex flex-col space-y-4">
                <NavLinks />
              </div>
            </div>

            <div className="border-b border-gray-800 pb-6">
              <InstallBtn />
            </div>

            <div>
              <AuthButtons />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
