import { Typography } from '@spotify/ui';
import Image from 'next/image';

export const QRcode = () => {
  return (
    <div className="container rounded-3xl bg-bgSecondary py-20 pb-0 mt-2">
      <div className="flex flex-col items-start gap-8">
        <Typography as='h1' size={'heading1'} className={'leading-[1.2] text-center w-full'}>
          Discover a World of Music with Spotify
        </Typography>
        <Image
          alt="QR-code"
          className={'mx-auto'}
          height={652}
          src="/images/phone.png"
          width={516}
        />
      </div>
    </div>
  );
};
