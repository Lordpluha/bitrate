import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form'

const TestForm = ({ onSubmit }: { onSubmit: (values: { name: string }) => void }) => {
  const methods = useForm({ defaultValues: { name: '' } })
  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormField
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

describe('Form integration', () => {
  it('shows a validation message and blocks submit when invalid', async () => {
    const onSubmit = vi.fn()
    render(<TestForm onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(screen.getByText('Name is required')).toBeInTheDocument())
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the form when the field is valid', async () => {
    const onSubmit = vi.fn()
    render(<TestForm onSubmit={onSubmit} />)
    await userEvent.type(screen.getByRole('textbox'), 'Ada')
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'Ada' })
  })
})
