export const MobileBLock = () => {
  return (
    <div className="relative flex-1 p-20 pt-[160px] rounded-3xl bg-hero-gradient mt-2 flex flex-col items-center border-green border-solid border-2 overflow-hidden">
      <img className="w-full h-full absolute top-0 bottom-0 left-0 right-0 z-[1] object-contain" src="/images/spotify-curves.svg" alt="" />
      <img className="w-full h-full absolute top-[120px] bottom-0 left-0 right-0 z-[2] object-contain" src="/images/intro-phone.png" alt="" />
      <img className="w-[364px] h-[54px] absolute bottom-[132px] left-0 right-0 z-[3] object-cover" src="/images/spotify-music-1.png" alt="" />
      <img className="w-[364px] h-[84px] absolute bottom-10 left-10 right-0 z-[3] object-cover" src="/images/spotify-music-2.png" alt="" />
    </div>
  )
}
