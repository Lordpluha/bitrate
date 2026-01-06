import { Typography } from '@spotify/ui-react'
import Image from 'next/image'

import paymentMethods from '../config/payment-methods.json'
import plans from '../config/plans.json'

import { PlanCard } from './PlanCard'

export const Plans = () => {
  return (
    <div className="py-16 container 3xl:!max-w-[1540px] text-center max-lg:py-12 max-md:py-8">
      <div className="container mb-16 max-lg:mb-14 max-md:mb-12">
        <Typography as="h1" className={'leading-[1.2] mb-8'} size={'heading1'}>
          Pick Your Premium
        </Typography>

        <Typography as="p" className={'mb-6'} size={'body'}>
          Upgrade to Spotify Premium and take your music journey to the next
          level. Enjoy uninterrupted music playback, even in offline mode
        </Typography>

        <div className="flex items-center justify-center gap-4">
          {paymentMethods.map((icon) => (
            <Image
              alt={icon.alt}
              className="w-auto h-auto max-h-16"
              height={38}
              key={icon.src}
              src={icon.src}
              width={38}
            />
          ))}
        </div>
      </div>

      <div className="container grid grid-cols-4 gap-6 items-center max-xl:grid-cols-2 max-sm:grid-cols-1">
        {plans.map((plan) => (
          <PlanCard key={plan.name} {...plan} />
        ))}
      </div>
    </div>
  )
}
