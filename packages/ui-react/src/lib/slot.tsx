import { Children, cloneElement, type HTMLAttributes, isValidElement, type ReactNode } from 'react'

type AnyProps = Record<string, unknown>

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...childProps }
  for (const key of Object.keys(slotProps)) {
    const sv = slotProps[key]
    const cv = childProps[key]
    if (/^on[A-Z]/.test(key)) {
      merged[key] =
        sv && cv
          ? (...args: unknown[]) => {
              ;(cv as (...a: unknown[]) => void)(...args)
              ;(sv as (...a: unknown[]) => void)(...args)
            }
          : (sv ?? cv)
    } else if (key === 'style') {
      merged[key] = { ...(sv as object), ...(cv as object) }
    } else if (key === 'className') {
      merged[key] = [sv, cv].filter(Boolean).join(' ')
    } else if (cv === undefined) {
      merged[key] = sv
    }
  }
  return merged
}

export const Slottable = ({ children }: { children: ReactNode }) => <>{children}</>

const isSlottable = (child: ReactNode): child is ReturnType<typeof Slottable> =>
  isValidElement(child) && child.type === Slottable

export const Slot = ({
  children,
  ...slotProps
}: HTMLAttributes<HTMLElement> & { children?: ReactNode }) => {
  const childArray = Children.toArray(children)
  const slottable = childArray.find(isSlottable)

  if (slottable) {
    const inner = isValidElement(slottable)
      ? (slottable.props as { children?: ReactNode }).children
      : null
    if (!isValidElement(inner)) return <>{children}</>
    const siblings = childArray.filter((c) => !isSlottable(c))
    const innerChildren = (inner.props as { children?: ReactNode }).children
    return cloneElement(
      inner,
      mergeProps(slotProps as AnyProps, inner.props as AnyProps),
      ...siblings,
      innerChildren,
    )
  }

  if (!isValidElement(children)) return children as ReactNode

  return cloneElement(children, mergeProps(slotProps as AnyProps, children.props as AnyProps))
}
