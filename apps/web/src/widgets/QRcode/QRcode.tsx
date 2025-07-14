import { Heading1 } from "@spotify/ui";
import { GreyBlock } from "@widgets/GreyBlock";
import Image from "next/image";

export const QRcode = () => {
  return (
    <GreyBlock className="pb-0 mt-2">
      <div className="flex flex-col items-start gap-8">
        <Heading1 className={"leading-[1.2] text-center w-full"}>
          Discover a World of Music with Spotify
        </Heading1>
        <Image
          src="/images/phone.png"
          alt="QR-code"
          width={516}
          height={652}
          className={"mx-auto"}
        />
      </div>
    </GreyBlock>
  );
};
