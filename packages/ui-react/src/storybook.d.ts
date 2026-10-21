import type { Meta as DefaultMeta } from '@storybook/react-vite'
import type { ComponentProps, ComponentType } from 'react'

declare module '@storybook/react-vite' {
  /**
   * Strict typed Storybook Meta type that limits argTypes options to the component prop's values.
   *
   * Options are checked as an array of allowed values rather than a tuple of the whole union:
   * a union-to-tuple conversion follows TypeScript's internal union order, which shifts whenever
   * an unrelated file changes, and then rejects stories nobody touched.
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
        options?: readonly NonNullable<ComponentProps<TComponent>[PropName]>[]
      }
    }
  }
}
