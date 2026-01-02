import type { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="py-28 h-full bg-auth-spotify bg-gradient-animated animate-gradient-shift">
      <div className="container max-w-[1440px] flex mx-auto items-stretch relative">
        {children}
      </div>
    </div>
  );
}
