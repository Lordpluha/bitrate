import { Typography } from '@spotify/ui-react'

export const MainView = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Typography as="h1" className="text-primary mb-4" size={'heading1'}>
          Main
        </Typography>
      </div>
    </div>
  )
}
