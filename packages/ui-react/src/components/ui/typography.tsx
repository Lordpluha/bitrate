import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from "class-variance-authority"
import type { ElementType, HTMLAttributes, PropsWithChildren } from "react"

/**
 * Нужно будет сделать нормальные размеры текстов в tailwind
 */
export const typographyVariants = cva('', {
  variants: {
    size: {
      heading1: 'text-[4.5rem] max-lg:text-4xl max-md:text-3xl',
      heading2: 'text-[2.875rem] max-lg:text-3xl max-md:text-2xl',
      heading3: 'text-[2.25rem] max-lg:text-2xl max-md:text-xl',
      heading4: 'text-[1.875rem] max-lg:text-xl max-md:text-lg',
      heading5: 'text-[1.5rem] max-lg:text-lg max-md:text-base',
      heading6: 'text-[1.125rem] max-lg:text-base max-md:text-sm',
      body: ''
    }
  },
  defaultVariants: {
    size: 'body'
  },
})

export interface TypographyBaseProps extends VariantProps<typeof typographyVariants>, HTMLAttributes<HTMLElement> { }

export type TypographyFeatureProps = { level: 1 | 2 | 3 | 4 | 5 | 6; as?: undefined, asChild?: false }
  | { as: ElementType; level?: undefined, asChild?: false }
  | { asChild: true; level?: undefined; as?: undefined }

export type TypographyProps = TypographyBaseProps & TypographyFeatureProps

export const Typography = ({
  color,
  children,
  className,
  level,
  size,
  asChild = false,
  as,
  ...props
}: PropsWithChildren<TypographyProps>) => {
  const Element = asChild ? Slot : as || ((level !== undefined ? `h${level}` : 'p') as ElementType)

  return <Element
    className={typographyVariants({ size, className })}
    data-level={level}
    {...props}
  >
    {children}
  </Element>
}