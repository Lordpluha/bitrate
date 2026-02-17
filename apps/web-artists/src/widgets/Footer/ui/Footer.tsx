import { SpotifyLogo, FooterIos, FooterAndroid, InstagramArtist, Linkedin, Tiktok, XTwitter, cn } from '@spotify/ui-react'
import { SwitchLanguagesButton } from '@shared/ui'
import Link from 'next/link'
import footerData from '../config/footer-links.json'


const appButtonComponents = {
  ios: FooterIos,
  android: FooterAndroid
} as const

type AppButtonType = keyof typeof appButtonComponents

const appButtonSocials = {
  instagram: InstagramArtist,
  linkedin: Linkedin,
  tiktok: Tiktok,
  xtwitter: XTwitter
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
    <footer className={
      cn('flex flex-col text-white bg-black px-5 pt-5 gap-14',
        'sm:px-14 sm:pt-12',
        '2xl:px-48 2xl:gap-24'

      )}>
      <div className={cn('flex flex-col gap-4',
        'sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-6',
        "lg:flex lg:flex-row lg:items-start lg:w-full lg:gap-6"
      )}>
        <div className="flex flex-col gap-16 lg:items-start lg:w-[15%]">
          <SpotifyLogo primaryColor="#ffffff" color3="#ffffff" color4="#ffffff" className="w-34 h-10" />
        </div>
        <div className={cn("flex flex-col gap-6 justify-between items-start",
          "sm:col-span-2 sm:row-start-2 sm:flex-row",
          "lg:flex lg:flex-row lg:items-start lg:w-[60%] lg:justify-start"
        )}>
          {footerData.columns.map((column, index) => (
            <div key={index}
              className='flex flex-col gap-4 lg:gap-6'>
              <h3 className="font-bold text-base text-white mb-2 uppercase">{column.title}</h3>
              {column.links?.map((link, linkIndex) => (
                <Link
                  key={linkIndex}
                  href={link.href}
                  className='text-neutral-400 text-base hover:text-white'
                >
                  {link.label}
                </Link>
              ))}
              {column.buttons?.map((button) => {
                if (!isAppButtonType(button.type)) return null
                const ButtonComponent = appButtonComponents[button.type]
                return (
                  <Link key={button.type} href={button.href} className="block">
                    <ButtonComponent className="w-42 h-14" />
                  </Link>
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex flex-row justify-start  gap-4 sm:justify-end">
          {footerData.socials.map((social, index) => {
            if (!isSocialButtonType(social.icon)) return null
            const ButtonComponent = appButtonSocials[social.icon]
            return (
              <Link key={index} href={social.href} className=" border-solid border rounded-4xl border-neutral-400 hover:border-white transition duration-300 transform hover:scale-110">
                <ButtonComponent className="w-8 h-8 m-2" />
              </Link>
            )
          })}
        </div>
      </div>
      <div className="sm:py-8 sm:flex-row flex flex-col justify-between items-center py-5 border-solid border-t border-neutral-800 text-neutral-400 text-sm  font-bold">
        <div className='sm:gap-6 sm:order-1 flex order-2 flex-row gap-4'>
          <div>
            <span className='font-normal'>© 2026 Spotify AB</span>
          </div>
            <ul className="sm:gap-6 flex flex-row gap-3">
              <li>
                <Link href="/#legal" className="text-neutral-400 hover:text-white ">
                  Legal
                </Link>
              </li>
              <li>
                <Link href="/#privacy" className="text-neutral-400 hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/#cookies" className="text-neutral-400 hover:text-white">
                  Cookies
                </Link>
              </li>
            </ul>
        </div>
        <div className="sm:mb-0 sm:order-2 flex items-center order-1 mb-4 gap-2 transform hover:scale-110 transition duration-300 ease-in-out">
          <SwitchLanguagesButton className='text-neutral-400' />
          <span>
            English
          </span>
        </div>
      </div>
    </footer>
  )
}
