import {
  CalendarIcon,
  MusicIcon,
  NoWifiIcon,
  PhoneIcon,
  Typography,
} from '@bitrate/ui-react'
import type { ReactNode } from 'react'

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

export const FeatureCard = ({ icon, description, title }: FeatureCardProps) => {
  const IconComponent = iconMap[icon as keyof typeof iconMap]

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-[124px] h-[124px] mb-4 flex flex-col items-center justify-center bg-background-secondary rounded-full shadow-primary-glow">
        {IconComponent && (
          <IconComponent
            className="text-primary fill-primary"
            height={48}
            width={48}
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
