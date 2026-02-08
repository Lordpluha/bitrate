import type { Meta as DefaultMeta } from '@storybook/react'
import type { ComponentProps, ComponentType } from 'react'

type UnionToIntersection<T> = (T extends unknown ? (arg: T) => void : never) extends (
  arg: infer I,
) => void
  ? I
  : never

type LastOfUnion<T> =
  UnionToIntersection<T extends unknown ? (arg: T) => void : never> extends (arg: infer L) => void
    ? L
    : never

type UnionToTuple<T, R extends unknown[] = []> = [T] extends [never]
  ? R
  : UnionToTuple<Exclude<T, LastOfUnion<T>>, [LastOfUnion<T>, ...R]>

declare module '@storybook/react-vite' {
  /**
   * Strict typed Storybook Meta type that infers argTypes options from component props.
   */
  export type StrictMeta<TComponent extends ComponentType> = Omit<
    DefaultMeta<TComponent>,
    'argTypes'
  > & {
    argTypes?: DefaultMeta<TComponent>['argTypes'] & {
      [PropName in keyof ComponentProps<TComponent>]?: Omit<
        DefaultMeta<TComponent>['argTypes'][PropName],
        'options'
      > & {
        options?: UnionToTuple<NonNullable<ComponentProps<TComponent>[PropName]>>
      }
    }
  }
}
