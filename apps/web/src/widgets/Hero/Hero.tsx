import Image from "next/image";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "@spotify/ui";
import clsx from "clsx";
import { HeadingBlock } from "./ui/HeadingBlock";
import { MobileBLock } from "./ui/MobileBlock";

export const Hero = () => {
  return (
    <div className="hero flex gap-2 items-stretch container-2 !max-w-[1580px] box-border max-lg:grid max-lg:grid-rows-2">
      <HeadingBlock />
      <MobileBLock/>
    </div>
  );
};
