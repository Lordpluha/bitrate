import React from 'react'
import Image from 'node_modules/next/image'
import Logo from "../../../../../public/images/logo.png"

const Header = () => {
  return (
    <header className='header'>
      <div className="container">
        <div className="header__wrap">
            <a href="#">
            <Image
            src={Logo}
            width={111}
            height={36}
            alt="spotify logo"
          />
            </a>
            <nav className='nav SMN_effect-16'>
            <ul className='flex items-baseline gap-16'>
              <a className='nav__link' href="#">Link</a>
              <a className='nav__link' href="#">Link</a>
              <a className='nav__link' href="#">Link</a>
            </ul>
          </nav>
        </div>
      </div>


    </header>
  )
}

export default Header
