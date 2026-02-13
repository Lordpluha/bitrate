import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import banner1 from '../../../assets/images/banner-1.jpg'
import banner2 from '../../../assets/images/banner-2.jpg'
import banner3 from '../../../assets/images/banner-3.jpg'
import banner4 from '../../../assets/images/banner-4.jpg'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'

const slides = [
  { src: banner1, alt: 'Banner 1' },
  { src: banner2, alt: 'Banner 2' },
  { src: banner3, alt: 'Banner 3' },
  { src: banner4, alt: 'Banner 4' },
]

type StoryArgs = { loop?: boolean }

const meta: Meta<StoryArgs> = {
  title: 'ui/Carousel',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Carousel component using Embla. Use `CarouselPrevious`/`CarouselNext` for navigation buttons.',
      },
    },
  },
  argTypes: {
    loop: {
      control: 'boolean',
      description: 'Enable/disable looping of the carousel',
    },
  },
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: (args) => (
    <div className="w-full max-w-(--breakpoint-sm) overflow-hidden">
      <Carousel opts={{ loop: args.loop ?? true }} className="h-full">
        <CarouselContent className="h-full flex">
          {slides.map(({ src, alt }) => (
            <CarouselItem key={alt} className="relative w-full h-full basis-full shrink-0">
              <img src={src} alt={alt} className="object-cover w-full h-full" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
}

export const WithNavigation: Story = {
  render: (args) => (
    <div className="w-full max-w-(--breakpoint-sm) relative overflow-hidden">
      <Carousel opts={{ loop: args.loop ?? true }} className="h-full">
        <CarouselPrevious className="z-20" />
        <CarouselNext className="z-20" />

        <CarouselContent className="h-full flex">
          {slides.map(({ src, alt }) => (
            <CarouselItem key={alt} className="relative w-full h-full basis-full shrink-0">
              <img src={src} alt={alt} className="object-cover w-full h-full" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="relative overflow-hidden h-250">
      <Carousel orientation="vertical" opts={{ loop: true }} className="h-full w-full">
        <CarouselPrevious className="z-20" />
        <CarouselNext className="z-20" />

        <CarouselContent className="h-full flex">
          {slides.map(({ src, alt }) => (
            <CarouselItem key={alt} className="relative w-full h-48 basis-full shrink-0">
              <img src={src} alt={alt} className="object-cover w-full h-full" />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
}

/**
 * The default form of the carousel with numbered items.
 */
export const Default: Story = {
  render: (args) => (
    <Carousel {...args} className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: hz
          <CarouselItem key={index}>
            <div className="bg-card flex aspect-square items-center justify-center rounded border p-6">
              <span className="text-4xl font-semibold">{index + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

/**
 * Use the `basis` utility class to change the size of the carousel items.
 */
export const Size: Story = {
  render: (args) => (
    <Carousel {...args} className="mx-12 w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: hz
          <CarouselItem key={index} className="basis-1/3">
            <div className="bg-card flex aspect-square items-center justify-center rounded border p-6">
              <span className="text-4xl font-semibold">{index + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
}

export const ShouldNavigate: Story = {
  name: 'when clicking next/previous buttons, should navigate through slides',
  tags: ['!dev', '!autodocs'],
  render: (args) => (
    <Carousel {...args} className="w-full max-w-xs">
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: hz
          <CarouselItem key={index}>
            <div className="bg-card flex aspect-square items-center justify-center rounded border p-6">
              <span className="text-4xl font-semibold">{index + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
  play: async ({ canvas, step }) => {
    const slides = await canvas.findAllByRole('group')
    expect(slides).toHaveLength(5)
    const nextBtn = await canvas.findByRole('button', { name: /next/i })
    const prevBtn = await canvas.findByRole('button', {
      name: /previous/i,
    })

    await step('navigate to the last slide', async () => {
      for (let i = 0; i < slides.length - 1; i++) {
        await userEvent.click(nextBtn)
      }
    })

    await step('navigate back to the first slide', async () => {
      for (let i = slides.length - 1; i > 0; i--) {
        await userEvent.click(prevBtn)
      }
    })
  },
}
