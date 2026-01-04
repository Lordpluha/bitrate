import { Separator } from '@spotify/ui-react';

export const SocialsAuthDivider = () => (
  <div className="flex items-center gap-2">
    <Separator className="flex-1" orientation="horizontal" />
    <span className="text-grey-500 text-sm">or</span>
    <Separator className="flex-1" orientation="horizontal" />
  </div>
);
