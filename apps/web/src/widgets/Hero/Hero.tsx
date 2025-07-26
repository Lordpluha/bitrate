

import clsx from "clsx";
import { HeadingBlock } from "./ui/HeadingBlock";
import { MobileBlock } from "./ui/MobileBlock";

export const Hero = () => {
  return (
    <div className="hero flex gap-2 items-stretch container p-0 box-border max-lg:grid max-lg:grid-rows-2">
      <HeadingBlock />
      <MobileBlock/>
    </div>
  );
};
