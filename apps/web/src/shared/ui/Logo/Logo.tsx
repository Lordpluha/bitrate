import Link from 'next/link'
import Image from 'next/image'

export const Logo = () => {
  return (
    <Link
      href='/'
      aria-label='Spotify Home'
      className='inline-block'
    >
      <Image
        src='/logo.webp'
        onError={e => (e.currentTarget.srcset = '/logo.png')}
        width={111}
        height={36}
        alt='Spotify logo'
      />
    </Link>
  )
}
