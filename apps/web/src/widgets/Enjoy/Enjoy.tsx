import { Heading3 } from "@spotify/ui";
import { SimpleBLock } from "@widgets/SimpleBLock";
export const Enjoy = () => {
  return (
    <SimpleBLock>
      <div className="container flex flex-col items-center justify-center">
        <Heading3 className={"leading-[1.2] mb-8 max-md:mb-6"}>
          Enjoy Premium Features with Our Student Discount!
        </Heading3>
        <p className="mb-6 max-md:mb-4">
          Spotify loves students, and we've got a special treat for you! Elevate
          your music experience without breaking the bank. Unlock all the
          premium features you love at an exclusive student discount.
        </p>
        <a
          href="#"
          className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-white font-medium border-solid border-2 block mb-4 min-w-[254px]"
        >
          Learn more
        </a>
      </div>
    </SimpleBLock>
  );
};
