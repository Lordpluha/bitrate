import { Typography } from '@spotify/ui'
import Image from 'next/image'

export const QRcode = () => {
  return (
    <div className='container rounded-3xl bg-bgSecondary py-20 pb-0 mt-2'>
      <div className='flex flex-col items-start gap-8'>
        <Typography.Heading1 className={'leading-[1.2] text-center w-full'}>
          Discover a World of Music with Spotify
        </Typography.Heading1>
        <Image
          src='/images/phone.png'
          alt='QR-code'
          width={516}
          height={652}
          className={'mx-auto'}
        />
      </div>
    </div>
  )
}
