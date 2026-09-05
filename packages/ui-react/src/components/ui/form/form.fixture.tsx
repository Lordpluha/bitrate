import { useForm } from 'react-hook-form'
import { Input } from '../input'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from './form'

export const FormFixture = () => {
  const methods = useForm({ defaultValues: { name: '' } })
  return (
    <Form {...methods}>
      <div style={{ width: 280 }}>
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormDescription>Enter your full name</FormDescription>
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}
