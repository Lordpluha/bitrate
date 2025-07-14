import { Heading1, Heading5, Typography } from "@spotify/ui";
import { SimpleBLock } from "@widgets/SimpleBLock";
import Image from "next/image";

export const Plans = () => {
  return (
    <SimpleBLock>
      <div className="container mb-16 max-lg:mb-14 max-md:mb-12">
        <Typography.Heading1 className={"leading-[1.2] mb-8"}>
          Pick Your Premium
        </Typography.Heading1>
        <p className="mb-6">
          Upgrade to Spotify Premium and take your music journey to the next
          level. Enjoy uninterrupted music playback, even in offline mode
        </p>
        <div className="flex items-center justify-center gap-4">
          <Image
            className="w-auto h-auto max-h-16"
            src="/images/upi.png"
            alt="Lipi"
            width={38}
            height={38}
          />
          <Image
            className="w-auto h-auto max-h-16"
            src="/images/paytm.png"
            alt="Paytm"
            width={38}
            height={38}
          />
          <Image
            className="w-auto h-auto max-h-16"
            src="/images/visa.png"
            alt="Visa"
            width={38}
            height={38}
          />
          <Image
            className="w-auto h-auto max-h-16"
            src="/images/master-card.png"
            alt="Mastercard"
            width={38}
            height={38}
          />
          <Image
            className="w-auto h-auto max-h-16"
            src="/images/american-express.png"
            alt="AmericanExpress"
            width={38}
            height={38}
          />
        </div>
      </div>

      <div className="container-2 grid grid-cols-4 gap-6 items-center max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className="bg-[#121212] h-full shadow-[0_6px_20px_1px_rgba(30,215,96,0.3)] p-8 rounded-xl flex flex-col items-start justify-start">
          <div className="border-[#003480] border-solid border-[1px] py-2 px-4 rounded-lg mb-4">
            <span className="text-[#003480] font-semibold text-xl leading-[1]">
              One-time plan available
            </span>
          </div>
          <div className="pb-6 mb-6 border-b-2 border-white border-solid flex w-full flex-col items-start ">
            <Heading5 className="mb-3">Mini</Heading5>
            <p className="mb-3">From ₹7/day</p>
            <p>1 account on mobile only</p>
          </div>
          <ul className="text-left flex flex-col items-start gap-2 mb-6">
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Ad-free music listening</span>
            </li>
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Group Session</span>
            </li>
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Download 30 songs on 1 mobile device</span>
            </li>
          </ul>
          <div className="mt-auto mb-0 w-full flex items-start flex-col ">
            <a
              href="#"
              className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-white font-medium border-solid border-2 w-full block mb-4"
            >
              View Plans
            </a>
            <a
              className="hover:opacity-70 transition-[1s] text-left text-[#CCCCCC] border-b-[1px] border-solid border-[#CCCCCC]"
              href="#"
            >
              Terms and conditions apply
            </a>
          </div>
        </div>
        <div className="bg-[#121212] h-full shadow-[0_6px_20px_1px_rgba(30,215,96,0.3)] p-8 rounded-xl flex flex-col items-start justify-start">
          <div className="border-[#003480] border-solid border-[1px] py-2 px-4 rounded-lg mb-4">
            <span className="text-[#003480] font-semibold text-xl leading-[1]">
              One-time plan available
            </span>
          </div>
          <div className="pb-6 mb-6 border-b-2 border-white border-solid flex w-full flex-col items-start ">
            <Heading5 className="mb-3">Individual</Heading5>
            <p className="mb-3">From ₹119/month</p>
            <p>1 account</p>
          </div>
          <ul className="text-left flex flex-col items-start gap-2 mb-6">
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Ad-free music listening</span>
            </li>
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Group Session</span>
            </li>
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Download 10k songs/device on 5 devices</span>
            </li>
          </ul>
          <div className="mt-auto mb-0 w-full flex items-start flex-col ">
            <a
              href="#"
              className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-white font-medium border-solid border-2 w-full block mb-4"
            >
              View Plans
            </a>
            <a
              className="hover:opacity-70 transition-[1s] text-left text-[#CCCCCC] border-b-[1px] border-solid border-[#CCCCCC]"
              href="#"
            >
              Terms and conditions apply
            </a>
          </div>
        </div>
        <div className="bg-[#121212] border-[#0E672E] border-solid border-4 h-full shadow-[0_6px_20px_1px_rgba(30,215,96,0.3)] p-8 rounded-xl flex flex-col items-start justify-start">
          <div className="border-[#003480] border-solid border-[1px] py-2 px-4 rounded-lg mb-4">
            <span className="text-[#003480] font-semibold text-xl leading-[1]">
              One-time plan available
            </span>
          </div>
          <div className="pb-6 mb-6 border-b-2 border-white border-solid flex w-full flex-col items-start ">
            <Heading5 className="mb-3">Duo</Heading5>
            <p className="mb-3">From ₹149/month</p>
            <p>2 accounts</p>
          </div>
          <ul className="text-left flex flex-col items-start gap-2 mb-6">
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>For couples with live together</span>
            </li>
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Ad-free music listening</span>
            </li>
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Group Session</span>
            </li>
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Download 10k songs/device on 5 devices</span>
            </li>
          </ul>
          <div className="mt-auto mb-0 w-full flex items-start flex-col ">
            <a
              href="#"
              className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-white font-medium border-solid border-2 border-[#1ED760] w-full block mb-4 bg-[#1ED760]"
            >
              View Plans
            </a>
            <a
              className="hover:opacity-70 transition-[1s] text-left text-[#CCCCCC] border-b-[1px] border-solid border-[#CCCCCC]"
              href="#"
            >
              Terms and conditions apply
            </a>
          </div>
        </div>
        <div className="bg-[#121212] h-full shadow-[0_6px_20px_1px_rgba(30,215,96,0.3)] p-8 rounded-xl flex flex-col items-start justify-start">
          <div className="border-[#003480] border-solid border-[1px] py-2 px-4 rounded-lg mb-4">
            <span className="text-[#003480] font-semibold text-xl leading-[1]">
              One-time plan available
            </span>
          </div>
          <div className="pb-6 mb-6 border-b-2 border-white border-solid flex w-full flex-col items-start ">
            <Heading5 className="mb-3">Family</Heading5>
            <p className="mb-3">From ₹179/month</p>
            <p>up to 6 accounts</p>
          </div>
          <ul className="text-left flex flex-col items-start gap-2 mb-6">
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>For family who live together</span>
            </li>
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Block explicit music</span>
            </li>
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Ad-free music listening</span>
            </li>
            <li className="flex items-center gap-3">
              <Image
                src={"/icons/green-check.svg"}
                alt="Check"
                height={22}
                width={14}
              />
              <span>Download 10k songs/device on 5 devices</span>
            </li>
          </ul>
          <div className="mt-auto mb-0 w-full flex items-start flex-col ">
            <a
              href="#"
              className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-white font-medium border-solid border-2 w-full block mb-4"
            >
              View Plans
            </a>
            <a
              className="hover:opacity-70 transition-[1s] text-left text-[#CCCCCC] border-b-[1px] border-solid border-[#CCCCCC]"
              href="#"
            >
              Terms and conditions apply
            </a>
          </div>
        </div>
      </div>
    </SimpleBLock>
  );
};
