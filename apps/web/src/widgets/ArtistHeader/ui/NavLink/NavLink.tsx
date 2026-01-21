import React from 'react'

import { cn } from '@spotify/ui-react'
import Link from 'next/link'
import links from '../../config/nav-links.json'

export const NavLinks = () => {
  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null)

  return (
    <div className="relative">
      <nav className="flex items-center gap-8">
        {links.map((link) => (
          <div
            key={link.title}
            onMouseEnter={() => link.submenu && setActiveSubmenu(link.title)}
          >
            <Link
              className={cn(
                'text-base text-white font-bold',
                'relative inline-block',
                'before:content-[""]',
                'before:absolute',
                'before:left-0',
                'before:-bottom-px',
                'before:h-0.5 before:w-full',
                'before:bg-white',
                'before:origin-left before:scale-x-0',
                'before:transition-transform before:duration-300 before:ease-in-out',
                'hover:before:scale-x-100',
              )}
              href={link.href}
            >
              {link.title}
            </Link>
          </div>
        ))}
      </nav>

      {links.map((link) =>
        link.submenu ? (
          <div
            key={link.title}
            onMouseEnter={() => setActiveSubmenu(link.title)}
            onMouseLeave={() => setActiveSubmenu(null)}
            className={cn(
              'fixed left-0 right-0 bg-black pb-8 mt-2 z-50',
              'transition-all duration-500 ease-in-out',
              activeSubmenu === link.title
                ? 'opacity-100 visible translate-y-2'
                : 'opacity-0 invisible -translate-y-4 pointer-events-none',
            )}
          >
            <div className="container mx-auto px-8 grid grid-cols-4 gap-8 py-8">
              {link.submenu.map((section) => (
                <div key={section.title}>
                  <h4
                    className={cn(
                      'text-4xl text-white font-bold',
                      'relative inline-block',
                      'before:content-[""]',
                      'before:absolute',
                      'before:left-0',
                      'before:-bottom-px',
                      'before:h-0.5 before:w-full',
                      'before:bg-white',
                      'before:origin-left before:scale-x-0',
                      'before:transition-transform before:duration-300 before:ease-in-out',
                      'hover:before:scale-x-100',
                    )}
                  >
                    {section.title}
                  </h4>
                  <ul className="space-y-2 mt-4">
                    {section.links.map((subLink) => (
                      <li key={subLink.title}>
                        <Link
                          className={cn(
                            'text-base text-white font-bold',
                            'relative inline-block',
                            'before:content-[""]',
                            'before:absolute',
                            'before:left-0',
                            'before:-bottom-px',
                            'before:h-0.5 before:w-full',
                            'before:bg-white',
                            'before:origin-left before:scale-x-0',
                            'before:transition-transform before:duration-300 before:ease-in-out',
                            'hover:before:scale-x-100',
                          )}
                          href={subLink.href}
                        >
                          {subLink.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null,
      )}
    </div>
  )
}
