"use client";

import { useAppSelector, useMediaQuery } from "@shared/hooks";
import {
  ResizableHandle,
  ResizableLayout as ResizableLayoutShadCN,
  ResizablePanel,
  cn,
  usePanelRef,
} from "@spotify/ui-react";
import { LeftSidebar } from "@widgets/LeftSidebar";
import { MainHeader } from "@widgets/MainHeader";
import { Player } from "@widgets/Player";
import { RightSidebar } from "@widgets/RightSidebar";
import { useState } from "react";
import type { PropsWithChildren } from "react";
import { ChevronLeft, House, Search, Library, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function MainLayout({ children }: PropsWithChildren) {
  const { currentTrack } = useAppSelector((state) => state.musicPlayer);
  const hasPlayer = !!currentTrack;
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const rightPanelRef = usePanelRef();
  const isDesktop = useMediaQuery('(min-width: 1280px)');
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const pathname = usePathname();
  const router = useRouter();

  const handleCollapse = () => {
    rightPanelRef.current?.collapse();
  };

  const handleExpand = () => {
    rightPanelRef.current?.expand();
  };

  const handleRightPanelResize = ({ asPercentage }: { asPercentage: number }) => {
    setIsRightSidebarCollapsed(asPercentage <= 4);
  };

  if (isMobile) {
    return (
      <div className="h-dvh bg-background text-text overflow-hidden">
        <MainHeader />

        <div
          className={cn(
            "h-[calc(100dvh-64px)] overflow-y-auto custom-scrollbar",
            hasPlayer ? "pb-40" : "pb-20",
          )}
        >
          {children}
        </div>

        <nav className="fixed left-0 right-0 bottom-0 z-45 h-16 border-t border-white/10 bg-black/90 backdrop-blur-md">
          <div className="h-full grid grid-cols-4 px-2">
            <button
              type="button"
              onClick={() => router.push('/main')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                pathname === '/main' ? 'text-white' : 'text-white/60 hover:text-white/90',
              )}
            >
              <House size={18} />
              <span>Главная</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center justify-center gap-1 text-xs text-white/60 hover:text-white/90 transition-colors"
            >
              <Search size={18} />
              <span>Поиск</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/main/library')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                pathname.startsWith('/main/library') ? 'text-white' : 'text-white/60 hover:text-white/90',
              )}
            >
              <Library size={18} />
              <span>Your Library</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center justify-center gap-1 text-xs text-white/60 hover:text-white/90 transition-colors"
            >
              <Plus size={18} />
              <span>Создать</span>
            </button>
          </div>
        </nav>

        <Player />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-text">
      <MainHeader />
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          hasPlayer ? "h-[calc(100vh-64px-90px)]" : "h-[calc(100vh-64px)]",
        )}
      >
        <div className="h-full w-full overflow-hidden">
          <ResizableLayoutShadCN
            orientation="horizontal"
            className="h-full w-full"
          >
            <ResizablePanel
              defaultSize={15}
              minSize={15}
              maxSize={20}
              className="overflow-hidden rounded-lg bg-background-secondary m-1.5"
            >
              <LeftSidebar />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel
              defaultSize={70}
              minSize={40}
            >
              {children}
            </ResizablePanel>

            {hasPlayer && isDesktop && <ResizableHandle disabled={isRightSidebarCollapsed} />}

            {hasPlayer && isDesktop && (
              <ResizablePanel
                panelRef={rightPanelRef}
                defaultSize={15}
                minSize={20}
                maxSize={30}
                collapsible
                collapsedSize={4}
                onResize={handleRightPanelResize}
                className="overflow-hidden rounded-lg bg-background-secondary m-1.5 relative"
              >
                <RightSidebar onCollapse={handleCollapse} />
                {isRightSidebarCollapsed && (
                  <button
                    type="button"
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-lg cursor-pointer bg-background-secondary opacity-100 hover:opacity-80 transition-opacity duration-300 ease-in-out"
                    onClick={handleExpand}
                    aria-label="Expand sidebar"
                  >
                    <ChevronLeft className="text-gray-300 w-5 h-5 transition-transform duration-300 hover:scale-110" />
                  </button>
                )}
              </ResizablePanel>
            )}
          </ResizableLayoutShadCN>
        </div>
      </div>
      <Player />
    </div>
  );
}
