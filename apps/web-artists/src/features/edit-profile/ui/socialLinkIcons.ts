import {
  InstagramIcon,
  TiktokIcon,
  XTwitter,
  YoutubeIcon,
} from '@bitrate/ui-react'
import type { SocialLinkKey } from '@entities/artist-account'
import { Cloud, Globe } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

/** One mark per link; SoundCloud has none in the icon set, so it borrows a cloud. */
export const socialLinkIcons: Record<
  SocialLinkKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  website: Globe,
  instagram: InstagramIcon,
  x: XTwitter,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
  soundcloud: Cloud,
}
