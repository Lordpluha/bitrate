import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { Input } from '../input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './form'

const Harness = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: { name: '' } })
  return <Form {...methods}>{children}</Form>
}

describe('Form', () => {
  it('renders a labelled field with an associated control', () => {
    render(
      <Harness>
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Your full name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </Harness>,
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Your full name')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('links the label to the control via htmlFor/id', () => {
    render(
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
    const label = screen.getByText('Name')
    const input = screen.getByRole('textbox')
    expect(label).toHaveAttribute('for', input.getAttribute('id'))
  })

  it('does not render a message when there is no error', () => {
    render(
      <Harness>
        <FormField
          name="name"
          render={() => (
            <FormItem>
              <FormMessage />
            </FormItem>
          )}
        />
      </Harness>,
    )
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument()
  })
})
