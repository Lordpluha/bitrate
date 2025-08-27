import { Typography } from '@spotify/ui'
import { FC, ReactNode } from 'react'
import { CalendarIcon, NoWifiIcon, PhoneIcon, MusicIcon } from '@shared/ui'

const iconMap = {
  CalendarIcon,
  NoWifiIcon,
  PhoneIcon,
  MusicIcon
}

type FeatureCardProps = {
  icon: string
  title: ReactNode
  description: ReactNode
}

export const FeatureCard: FC<FeatureCardProps> = ({
  icon,
  description,
  title
}) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap]

  return (
    <div className='flex flex-col items-center justify-center text-center'>
      <div className='w-[124px] h-[124px] mb-4 flex flex-col items-center justify-center bg-bgSecondary rounded-full shadow-[0_6px_20px_1px_#1ed7604d]'>
        <IconComponent className='text-green-500 fill-green-500' />
      </div>

      <Typography.Heading5>{title}</Typography.Heading5>
      <Typography.Paragraph>{description}</Typography.Paragraph>
    </div>
  )
}
