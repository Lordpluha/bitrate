import Image from 'next/image'
import { Typography } from '@spotify/ui'
import { FC, ReactNode } from 'react'
import { CalendarIcon, NoWifiIcon, PhoneIcon, MusicIcon } from '@shared/ui'

type FeatureCardProps = {
  icon: string
  alt?: string
  title: ReactNode
  description: ReactNode
}

const iconMap = {
  CalendarIcon,
  NoWifiIcon,
  PhoneIcon,
  MusicIcon
}

export const FeatureCard: FC<FeatureCardProps> = ({
  icon,
  description,
  title,
  alt
}) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap]
  return (
    <div className='flex flex-col items-center justify-center text-center'>
      <div className='w-[124px] h-[124px] mb-4 flex flex-col items-center justify-center bg-bgSecondary rounded-full shadow-[0_6px_20px_1px_#1ed7604d]'>
        {
          <IconComponent className='text-greenMain fill-greenMain' />
        }
      </div>

      <Typography.Heading5>{title}</Typography.Heading5>
      <Typography.Paragraph>{description}</Typography.Paragraph>
    </div>
  )
}
