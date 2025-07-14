import { Heading1 } from "@spotify/ui";
import { Card } from "./ui/Card";
import { SimpleBLock } from "@widgets/SimpleBLock";

const cardData = [
  {
    icon: "/icons/calendar-icon.png",
    title: "Ad-free music listening",
    description: "Enjoy uninterrupted music",
  },
  {
    icon: "/icons/wifi-icon.png",
    title: "Offline Mode",
    description: "Download and play anywhere",
  },
  {
    icon: "/icons/music-icon.png",
    title: "High Quality Audio",
    description: "Feel the music in every detail",
  },
  {
    icon: "/icons/phone-icon.png",
    title: "Play on any device",
    description: "Switch seamlessly between platforms",
  },
];

export const Info = () => {
  return (
    <SimpleBLock>
      <div className="container mb-16 max-lg:mb-12 max-md:mb-10">
        <Heading1 className={"leading-[1.2] mb-8"}>
          Enhance Your Music Journey with Premium
        </Heading1>
        <p>
          Upgrade to Spotify Premium and take your music journey to the next
          level. Enjoy uninterrupted music playback, even in offline mode. Say
          goodbye to those pesky ads, and indulge in high-quality audio for a
          truly immersive experience.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 items-center max-md:grid-cols-2 max-xs:grid-cols-1">
        {cardData.map((card, i) => (
          <Card key={i} {...card} />
        ))}
      </div>
    </SimpleBLock>
  );
};
