import { LeftSidebar } from '@widgets/LeftSidebar'

export default function LibraryPage() {
  return (
    <div className="h-full bg-background-secondary max-[1024px]:bg-background">
      <div className="h-full max-[1024px]:px-2 max-[1024px]:pt-2">
        <LeftSidebar />
      </div>
    </div>
  )
}
