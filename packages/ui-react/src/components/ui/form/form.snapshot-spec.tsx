import { render } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { Input } from '../input'
import { Form, FormControl, FormField, FormItem, FormLabel } from './form'

const Harness = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: { name: '' } })
  return <Form {...methods}>{children}</Form>
}

describe('Form snapshots', () => {
  it('matches snapshot — labelled field', () => {
    const { container } = render(
      <Harness>
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </Harness>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
