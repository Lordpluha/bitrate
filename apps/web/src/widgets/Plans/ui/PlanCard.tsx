import { ROUTES } from '@shared/routes';
import { Typography } from '@spotify/ui';
import clsx from 'clsx';
import Link from 'next/link';
import type { FC } from 'react';

import type plansConfig from '../config/plans.json';

import { PlansList } from './PlanFeaturesList';

export type PlanCardProps = (typeof plansConfig)[number];

export const PlanCard: FC<PlanCardProps> = ({
  accounts,
  features,
  highlight,
  name,
  price,
}) => {
  return (
    <div
      className={clsx(
        'bg-bgSecondary h-full shadow-[0_6px_20px_1px_#1ed7604d] p-8 rounded-xl flex flex-col items-start justify-start text-text',
        !!highlight && 'border-green-600 border-solid border-4',
      )}
    >
      <div className="border-blue-500 border-solid border-[1px] py-2 px-4 rounded-lg mb-4">
        <span className="text-blue-500 font-semibold text-xl leading-[1]">
          One-time plan available
        </span>
      </div>
      <div className="pb-6 mb-6 border-b-2 border-text border-solid flex w-full flex-col items-start">
        <Typography as='h5' size={'heading5'} className="mb-3">{name}</Typography>
        <Typography as='p' size={'body'} className="mb-3">{price}</Typography>
        <Typography as='p' size={'body'}>{accounts}</Typography>
      </div>

      <PlansList features={features} />

      <div className="mt-auto mb-0 w-full flex items-start flex-col">
        <Link
          className={clsx(
            'text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-text font-medium border-solid border-2 border-text w-full block mb-4',
            !!highlight && '!border-green-500 bg-green-500',
          )}
          href={ROUTES.plans}
        >
          View Plans
        </Link>
        <Link
          className="hover:opacity-70 transition-[1s] text-left text-grey-500 border-b-[1px] border-solid border-grey-500	"
          href={ROUTES.terms}
        >
          Terms and conditions apply
        </Link>
      </div>
    </div>
  );
};
