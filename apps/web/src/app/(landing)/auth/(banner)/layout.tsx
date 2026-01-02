import { AuthBanner } from '@shared/ui';
import type { PropsWithChildren } from 'react';

export default function AuthBannerLayout({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <AuthBanner />
    </>
  );
}
