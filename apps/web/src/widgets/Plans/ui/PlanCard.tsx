import clsx from 'clsx'
import React, { FC } from 'react'
import plansConfig from '../config/plans.json'
import Link from 'next/link'
import { PlansList } from './PlanFeaturesList'
import { Typography } from '@spotify/ui'

export type PlanCardProps = (typeof plansConfig)[number]

export const PlanCard: FC<PlanCardProps> = ({
  accounts,
  features,
  highlight,
  name,
  price
}) => {
  return (
    <div
      className={clsx(
        'bg-bgSecondary h-full shadow-[0_6px_20px_1px_#1ed7604d] p-8 rounded-xl flex flex-col items-start justify-start text-tBase',
        !!highlight && 'border-greenSecondary border-solid border-4'
      )}
    >
      <div className='border-blue border-solid border-[1px] py-2 px-4 rounded-lg mb-4'>
        <span className='text-blue font-semibold text-xl leading-[1]'>
          One-time plan available
        </span>
      </div>
      <div className='pb-6 mb-6 border-b-2 border-tBase border-solid flex w-full flex-col items-start'>
        <Typography.Heading5 className='mb-3'>{name}</Typography.Heading5>
        <Typography.Paragraph className='mb-3'>{price}</Typography.Paragraph>
        <Typography.Paragraph>{accounts}</Typography.Paragraph>
      </div>

      <PlansList features={features}></PlansList>

      <div className='mt-auto mb-0 w-full flex items-start flex-col'>
        <Link
          href='#'
          className={clsx(
            'text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-tBase font-medium border-solid border-2 border-tBase w-full block mb-4',
            !!highlight && '!border-green bg-green'
          )}
        >
          View Plans
        </Link>
        <Link
          className='hover:opacity-70 transition-[1s] text-left text-grey border-b-[1px] border-solid border-grey'
          href='#'
        >
          Terms and conditions apply
        </Link>
      </div>
    </div>
  )
}
