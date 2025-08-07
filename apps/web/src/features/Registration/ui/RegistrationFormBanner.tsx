'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'

const slides = [
  '/images/banner-1.jpg',
  '/images/banner-2.jpg',
  '/images/banner-3.jpg',
  '/images/banner-4.jpg',
]

export const RegistrationFormBanner = () => {
  return (
    <div className="basis-[50%] h-full overflow-hidden rounded-[0_10px_10px_0]">
     <Swiper
      modules={[Autoplay, EffectFade]}
      effect='fade'
      autoplay={{ delay: 2500, disableOnInteraction: false }}
      loop
      className='w-full h-full'
    >
      {slides.map((src, i) => (
        <SwiperSlide key={i}>
          <img src={src} alt={`Slide ${i + 1}`} className='w-full h-full object-cover' />
        </SwiperSlide>
      ))}
    </Swiper>
    </div>
  )
}
