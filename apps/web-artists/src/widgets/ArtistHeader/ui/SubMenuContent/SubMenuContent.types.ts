export interface Section {
  title: string
  href: string
}

export interface SubmenuGroup {
  title: string
  sections?: Section[]
}

export interface ResourceItem {
  id: string
  title: string
  description: string
  imageSrc: string
  href: string
}

export interface ResourceGroup {
  title: string
  sections?: ResourceItem[]
}

export interface SubMenuContentProps {
  activeSubmenu: string | null
  submenuData: SubmenuGroup[] | ResourceGroup[] | null
  type: 'features' | 'resources'
  isClosing: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}
