import React from 'react'
import Image from 'next/image'


const Header = () => {
  return (
    <header className='header'>
      <div className="container">
        <div className="header__wrap">
            <a href="#">
            <Image
            src={"/images/logo.png"}
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
