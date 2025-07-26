import { Typography } from '@spotify/ui'
import Image from 'next/image'
import plans from '../config/plans.json'
import paymentMethods from '../config/payment-methods.json'
import { PlanCard } from './PlanCard'

export const Plans = () => {
  return (
    <div className='py-16 container 3xl:!max-w-[1540px] text-center max-lg:py-12 max-md:py-8'>
      <div className='container mb-16 max-lg:mb-14 max-md:mb-12'>
        <Typography.Heading1 className={'leading-[1.2] mb-8'}>
          Pick Your Premium
        </Typography.Heading1>

        <Typography.Paragraph className={'mb-6'}>
          Upgrade to Spotify Premium and take your music journey to the next
          level. Enjoy uninterrupted music playback, even in offline mode
        </Typography.Paragraph>

        <div className='flex items-center justify-center gap-4'>
          {paymentMethods.map((icon, index) => (
            <Image
              key={index}
              className='w-auto h-auto max-h-16'
              src={icon.src}
              alt={icon.alt}
              width={38}
              height={38}
            />
          ))}
        </div>
      </div>

      <div className='container grid grid-cols-4 gap-6 items-center max-lg:grid-cols-2 max-sm:grid-cols-1'>
        {plans.map((plan, idx) => (
          <PlanCard key={idx} {...plan} />
        ))}
      </div>
    </div>
  )
}
