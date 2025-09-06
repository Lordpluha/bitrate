"use client"

import { useAuth } from '@shared/hooks';
import { ApiSchemas } from '@spotify/contracts';
import { Button, Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@spotify/ui';
import { FC, HTMLAttributes, useState } from 'react';

interface ProfileButtonProps extends HTMLAttributes<HTMLDivElement> {
  username: ApiSchemas['UserEntity']['username'];
}

const generateColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 70%)`;
};

export const ProfileButton: FC<ProfileButtonProps> = ({ username, className, ...etcDivProps }) => {
  const [isHovered, setIsHovered] = useState(false);

  const firstLetter = username.charAt(0).toUpperCase();
  const backgroundColor = generateColor(username);

  const { logout } = useAuth()

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...etcDivProps}
    >
      <Popover>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger className='w-12 h-12 rounded-full hover:scale-105 transition-transform duration-200 bg-grey-900 p-2'>
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-black font-semibold text-xl"
                  style={{ backgroundColor }}
                >
                  {firstLetter}
                </div>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              {username}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <PopoverContent>
          <Button onClick={() => logout()}>
            Logout
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};
