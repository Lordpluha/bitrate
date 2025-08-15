
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import banner1 from './images/banner-1.jpg'
import banner2 from './images/banner-2.jpg'
import banner3 from './images/banner-3.jpg'
import banner4 from './images/banner-4.jpg'

import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './carousel'

const slides = [
	{ src: banner1, alt: 'Banner 1' },
	{ src: banner2, alt: 'Banner 2' },
	{ src: banner3, alt: 'Banner 3' },
	{ src: banner4, alt: 'Banner 4' },
]

type StoryArgs = { loop?: boolean }

const meta = {
	title: 'ui/Carousel',
	component: Carousel,
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
} as Meta<typeof Carousel>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: StoryObj<typeof meta> = {
	render: (args: any) => (
		<div className="w-full max-w-screen-sm overflow-hidden">
			<Carousel opts={{ loop: args.loop ?? true }} className="h-full">
				<CarouselContent className="h-full flex">
					{slides.map(({ src, alt }, i) => (
						<CarouselItem
							key={i}
							className="relative w-full h-full basis-full flex-shrink-0"
						>
							<img src={src} alt={alt} className="object-cover w-full h-full" />
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</div>
	),
}

export const WithNavigation: StoryObj<typeof meta> = {
	render: (args: any) => (
		<div className="w-full max-w-screen-sm relative overflow-hidden">
			<Carousel opts={{ loop: args.loop ?? true }} className="h-full">
				<CarouselPrevious className="z-20" />
				<CarouselNext className="z-20" />

				<CarouselContent className="h-full flex">
					{slides.map(({ src, alt }, i) => (
						<CarouselItem
							key={i}
							className="relative w-full h-full basis-full flex-shrink-0"
						>
							<img src={src} alt={alt} className="object-cover w-full h-full" />
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>
		</div>
	),
}

	export const Vertical: StoryObj<typeof meta> = {
		render: () => (
			<div className="relative overflow-hidden h-[1000px]">
				<Carousel orientation="vertical" opts={{ loop: true }} className="h-full w-full">
					<CarouselPrevious className="z-20" />
					<CarouselNext className="z-20" />

					<CarouselContent className="h-full flex">
						{slides.map(({ src, alt }, i) => (
							<CarouselItem
								key={i}
								className="relative w-full h-48 basis-full flex-shrink-0"
							>
								<img src={src} alt={alt} className="object-cover w-full h-full" />
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>
		),
	}

