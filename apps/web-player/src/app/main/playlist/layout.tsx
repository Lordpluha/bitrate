import type { PropsWithChildren } from "react";

export default function LikedSongsLayout({
	children,
}: PropsWithChildren) {
	return <div className="h-full overflow-y-auto custom-scrollbar">
		{children}
	</div>
}