import { Typography } from "@spotify/ui";
import { DownloadButton } from "./DownloadButton";
import { UserAvatars } from "./UserAvatars";

export const HeadingBlock = () => (
  <div className=" flex-1 p-20 pt-[160px] rounded-3xl bg-[#121212] mt-2 flex flex-col items-start gap-8 max-lg:p-10 max-lg:pt-[140px]">
    <Typography.Heading1 className={"leading-[1.2]"}>
      Discover a World of Music with Spotify
    </Typography.Heading1>
    <Typography.Paragraph className="text-xl"> Welcome to Spotify, where music comes alive. Experience a universe of endless tunes, handpicked playlists, and personalized recommendations just for you.</Typography.Paragraph>
    <DownloadButton/>
    <UserAvatars/>
  </div>
);
