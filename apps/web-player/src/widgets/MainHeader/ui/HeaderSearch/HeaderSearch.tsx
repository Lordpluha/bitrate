import { Input, ReviewIcon, SearchIcon } from "@spotify/ui-react";

export const HeaderSearch = () => {
  return (
    <div className="relative w-100">
      <SearchIcon
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-subdued z-10"
        width={20}
        height={20}
      />
      <Input
        className="pl-12"
        placeholder="What do you want to play?"
        type="text"
        variant="search"
      />
      <div className="pl-2 border-l-2 border-border absolute right-4 top-1/2 transform -translate-y-1/2">
        <ReviewIcon width={20} height={20} className="text-text-subdued" />
      </div>
    </div>
  );
};
