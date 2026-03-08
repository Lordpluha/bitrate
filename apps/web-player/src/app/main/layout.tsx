"use client";

import { useAppSelector } from "@shared/hooks";
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
import { ChevronLeft } from "lucide-react";

export default function MainLayout({ children }: PropsWithChildren) {
  const { currentTrack } = useAppSelector((state) => state.musicPlayer);
  const hasPlayer = !!currentTrack;
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const rightPanelRef = usePanelRef();

  const handleCollapse = () => {
    rightPanelRef.current?.collapse();
  };

  const handleExpand = () => {
    rightPanelRef.current?.expand();
  };

  const handleRightPanelResize = ({ asPercentage }: { asPercentage: number }) => {
    setIsRightSidebarCollapsed(asPercentage <= 4);
  };

  return (
    <div className="h-screen bg-background text-text">
      <MainHeader />
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          hasPlayer ? "h-[calc(100vh-64px-90px)]" : "h-[calc(100vh-64px)]",
        )}
      >
        <div className="h-full overflow-hidden">
          <ResizableLayoutShadCN
            orientation="horizontal"
            className="h-full"

          >
            <ResizablePanel
              defaultSize={12}
              minSize={10}
              maxSize={20}
              className="overflow-hidden rounded-lg bg-background-secondary m-1.5"
            >
              <LeftSidebar />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel
              defaultSize={68}
              minSize={40}
              className="overflow-hidden rounded-lg bg-background-secondary m-1.5 relative"
            >
              {children}
            </ResizablePanel>

            {hasPlayer && <ResizableHandle disabled={isRightSidebarCollapsed} />}

            {hasPlayer && (
              <ResizablePanel
                panelRef={rightPanelRef}
                defaultSize={20}
                minSize={20}
                maxSize={30}
                collapsible
                collapsedSize={4}
                onResize={handleRightPanelResize}
                className="overflow-hidden rounded-lg bg-background-secondary m-1.5 relative"
              >
                <RightSidebar onCollapse={handleCollapse} />
                {isRightSidebarCollapsed && (
                  <div
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-lg cursor-pointer bg-background-secondary opacity-100 hover:opacity-80 transition-opacity duration-300 ease-in-out"
                    onClick={handleExpand}
                    role="button"
                    aria-label="Expand sidebar"
                  >
                    <ChevronLeft className="text-gray-300 w-5 h-5 transition-transform duration-300 hover:scale-110" />
                  </div>
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
