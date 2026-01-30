import { ArtistHeader } from "@widgets/ArtistHeader/ui/ArtistHeader"

export const ArtistView: React.FC = () => {

  return (
    <div className=''>
      <ArtistHeader />
      <div className="w-[500px] h-[200vh] text-center flex items-center justify-center bg-red-500">
        <h1 className="text-4xl text-white font-bold">Artist</h1>
      </div>
    </div>
  )
}