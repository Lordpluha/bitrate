import { Typography } from '@spotify/ui-react';

export const MainPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Typography as='h1' size={'heading1'} className="text-primary mb-4">
          Main
        </Typography>
      </div>
    </div>
  );
};
