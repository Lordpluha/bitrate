import { Typography } from "@spotify/ui";
import { Wrap } from "@widgets/Wrap";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import plans from "./config/plans.json";
import paymentIcons from "./config/paymentIcons.json";
import { PlanList } from "./ui/PlanList";

export const Plans = () => {
  return (
    <Wrap>
      <div className="container mb-16 max-lg:mb-14 max-md:mb-12">
        <Typography.Heading1 className={"leading-[1.2] mb-8"}>
          Pick Your Premium
        </Typography.Heading1>
        <Typography.Paragraph className={"mb-6"}>
          Upgrade to Spotify Premium and take your music journey to the next
          level. Enjoy uninterrupted music playback, even in offline mode
        </Typography.Paragraph>
        <div className="flex items-center justify-center gap-4">
          {paymentIcons.map((icon, index) => (
            <Image
              key={index}
              className="w-auto h-auto max-h-16"
              src={icon.src}
              alt={icon.alt}
              width={38}
              height={38}
            />
          ))}
        </div>
      </div>

      <div className="container grid grid-cols-4 gap-6 items-center max-lg:grid-cols-2 max-sm:grid-cols-1">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={clsx(
              "bg-[#121212] h-full shadow-[0_6px_20px_1px_rgba(30,215,96,0.3)] p-8 rounded-xl flex flex-col items-start justify-start",
              {
                "border-[#0E672E] border-solid border-4": plan.highlight,
              },
            )}
          >
            <div className="border-[#003480] border-solid border-[1px] py-2 px-4 rounded-lg mb-4">
              <span className="text-[#003480] font-semibold text-xl leading-[1]">
                One-time plan available
              </span>
            </div>
            <div className="pb-6 mb-6 border-b-2 border-white border-solid flex w-full flex-col items-start">
              <Typography.Heading5 className="mb-3">
                {plan.name}
              </Typography.Heading5>
              <Typography.Paragraph className="mb-3">
                {plan.price}
              </Typography.Paragraph>
              <Typography.Paragraph>{plan.accounts}</Typography.Paragraph>
            </div>
            <PlanList features={plan.features}></PlanList>
            <div className="mt-auto mb-0 w-full flex items-start flex-col">
              <Link
                href="#"
                className={clsx(
                  "text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-white font-medium border-solid border-2 w-full block mb-4",
                  {
                    "border-[#1ED760] bg-[#1ED760]": plan.highlight,
                  },
                )}
              >
                View Plans
              </Link>
              <Link
                className="hover:opacity-70 transition-[1s] text-left text-[#CCCCCC] border-b-[1px] border-solid border-[#CCCCCC]"
                href="#"
              >
                Terms and conditions apply
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Wrap>
  );
};
