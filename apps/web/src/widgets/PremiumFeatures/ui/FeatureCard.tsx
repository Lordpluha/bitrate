import Image from 'next/image'
import { Typography } from '@spotify/ui'
import { FC, ReactNode } from 'react'

type FeatureCardProps = {
  icon: string
  alt?: string
  title: ReactNode
  description: ReactNode
}

export const FeatureCard: FC<FeatureCardProps> = ({
  icon,
  description,
  title,
  alt
}) => {
  return (
    <div className='flex flex-col items-center justify-center text-center'>
      <div className='w-[124px] h-[124px] mb-4 flex flex-col items-center justify-center bg-bgSecondary rounded-full shadow-[0_6px_20px_1px_#1ed7604d]'>
        <Image
          className='w-auto h-auto'
          src={icon}
          alt={alt || 'Card icon'}
          width={60}
          height={60}
        />
      </div>

      <Typography.Heading5>{title}</Typography.Heading5>
      <Typography.Paragraph>{description}</Typography.Paragraph>
    </div>
  )
}
