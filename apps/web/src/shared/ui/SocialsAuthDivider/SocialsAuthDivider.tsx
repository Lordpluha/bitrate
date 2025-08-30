import { Separator } from '@spotify/ui'

export const SocialsAuthDivider = () => (
  <div className='flex items-center gap-2'>
    <Separator
      orientation='horizontal'
      className='flex-1'
    />
    <span className='text-grey-500 text-sm'>or</span>
    <Separator
      orientation='horizontal'
      className='flex-1'
    />
  </div>
)
