import {
  Typography,
  CalendarIcon,
  NoWifiIcon,
  PhoneIcon,
  MusicIcon,
} from '@spotify/ui-react'
import type { FC, ReactNode } from 'react'

const iconMap = {
  CalendarIcon: CalendarIcon,
  NoWifiIcon: NoWifiIcon,
  PhoneIcon: PhoneIcon,
  MusicIcon: MusicIcon,
}

type FeatureCardProps = {
  icon: string
  title: ReactNode
  description: ReactNode
}

export const FeatureCard: FC<FeatureCardProps> = ({
  icon,
  description,
  title,
}) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap]

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-[124px] h-[124px] mb-4 flex flex-col items-center justify-center bg-bgSecondary rounded-full shadow-[0_6px_20px_1px_#1ed7604d]">
        {IconComponent && (
          <IconComponent
            className="text-green-500 fill-green-500"
            width={48}
            height={48}
          />
        )}
      </div>

      <Typography as="h5" size={'heading5'}>
        {title}
      </Typography>
      <Typography as="p" size={'body'}>
        {description}
      </Typography>
    </div>
  )
}
