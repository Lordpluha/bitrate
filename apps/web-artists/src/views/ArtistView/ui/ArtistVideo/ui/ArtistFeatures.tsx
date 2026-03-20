import config from '../config/ytVideo-config.json'

export const ArtistFeatures = () => {
  return (
    <section className='bg-black w-full flex justify-center'>
      <div className='lg:flex-row lg:py-12 w-full max-w-screen-2xl mx-auto py-8 flex flex-col relative gap-6 px-4'>

        <div className='lg:order-1 flex flex-col text-white order-2 mt-6'>
          <h4 className='xl:text-base text-sm font-normal uppercase'>Features</h4>
          <h1 className='xl:text-5xl text-4xl font-bold mt-2'>Tools built for your music</h1>
          <p className='text-base font-normal mt-4'>
            Grow your career while keeping your music at the center. With Spotify for Artists, you can
            amplify your reach, serve up videos, build pre-release hype, and sell merch and tickets –
            right where streaming happens.
          </p>
        </div>

        <div className='lg:order-2 order-1 w-full'>
          <div className='aspect-video'>
            <iframe
              src={config.ytVideo.src}
              title={config.ytVideo.title}
              className='w-full h-full object-cover'
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              referrerPolicy='strict-origin-when-cross-origin'
              allowFullScreen
              loading='lazy'
            />
          </div>
        </div>

      </div>
    </section>
  )
}
