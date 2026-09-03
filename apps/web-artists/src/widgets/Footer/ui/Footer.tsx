import {
  cn,
  FooterAndroid,
  FooterIos,
  InstagramArtist,
  Linkedin,
  LogoIcon,
  Tiktok,
  XTwitter,
} from '@bitrate/ui-react'
import { SwitchLanguagesButton } from '@shared/ui'
import Link from 'next/link'
import footerData from '../config/footer-links.json'

const appButtonComponents = {
  ios: FooterIos,
  android: FooterAndroid,
} as const

type AppButtonType = keyof typeof appButtonComponents

const appButtonSocials = {
  instagram: InstagramArtist,
  linkedin: Linkedin,
  tiktok: Tiktok,
  xtwitter: XTwitter,
} as const

type SocialButtonType = keyof typeof appButtonSocials

const isAppButtonType = (type: string): type is AppButtonType => {
  return type in appButtonComponents
}

const isSocialButtonType = (icon: string): icon is SocialButtonType => {
  return icon in appButtonSocials
}

export const Footer = () => {
  return (
    <footer className="w-full bg-black px-5 text-white">
      <div
        className={cn(
          'flex flex-col max-w-screen-2xl mx-auto pt-5 gap-14',
          'xs:px-6 xs:pt-4 gap-8',
          'sm:px-14 sm:pt-10',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-4',
            'xs:grid xs:grid-cols-2 xs:gap-x-4 xs:gap-y-6',
            'lg:flex lg:flex-row lg:items-start lg:w-full lg:gap-6',
          )}
        >
          <div className="flex flex-col gap-16 lg:items-start lg:w-[15%]">
            <LogoIcon className="h-10 w-10" />
          </div>
          <div
            className={cn(
              'flex flex-col gap-6 justify-between items-start',
              'xs:col-span-2 xs:row-start-2 xs:flex-row xs:gap-6',
              'lg:flex lg:flex-row lg:items-start lg:w-[60%] lg:justify-start',
            )}
          >
            {footerData.columns.map((column) => (
              <div
                className="xs:gap-2 flex flex-col gap-4 lg:gap-6"
                key={column.title}
              >
                <h3 className="font-bold text-xs text-white mb-2 uppercase">
                  {column.title}
                </h3>
                {column.links?.map((link) => (
                  <Link
                    className="text-neutral-400 font-medium text-base hover:text-white"
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
                {column.buttons?.map((button) => {
                  if (!isAppButtonType(button.type)) return null
                  const ButtonComponent = appButtonComponents[button.type]
                  return (
                    <Link
                      className="block"
                      href={button.href}
                      key={button.type}
                    >
                      <ButtonComponent className="w-42 h-14" />
                    </Link>
                  )
                })}
              </div>
            ))}
          </div>
          <div className="flex flex-row justify-start  gap-4 xs:justify-end xs:gap-2">
            {footerData.socials.map((social) => {
              if (!isSocialButtonType(social.icon)) return null
              const ButtonComponent = appButtonSocials[social.icon]
              return (
                <Link
                  className="border-solid border rounded-4xl border-neutral-400 hover:border-white transition duration-300 transform hover:scale-110"
                  href={social.href}
                  key={social.icon}
                >
                  <ButtonComponent className="w-8 h-8 m-2" />
                </Link>
              )
            })}
          </div>
        </div>
        <div className="xs:py-8 xs:flex-row flex flex-col justify-between items-center py-5 border-solid border-t border-neutral-800 text-neutral-400 text-sm font-bold">
          <div className="xs:gap-6 xs:order-1 flex order-2 flex-row gap-4">
            <div>
              <span className="font-normal">© 2026 Bitrate</span>
            </div>
            <ul className="xs:gap-6 flex flex-row gap-3">
              <li>
                <Link
                  className="text-neutral-400 hover:text-white "
                  href="/#legal"
                >
                  Legal
                </Link>
              </li>
              <li>
                <Link
                  className="text-neutral-400 hover:text-white"
                  href="/#privacy"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  className="text-neutral-400 hover:text-white"
                  href="/#cookies"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
          <div className="xs:mb-0 xs:order-2 flex items-center order-1 mb-4 gap-2 transform hover:scale-110 transition duration-300 ease-in-out">
            <SwitchLanguagesButton className="text-neutral-400" />
            <span>English</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
