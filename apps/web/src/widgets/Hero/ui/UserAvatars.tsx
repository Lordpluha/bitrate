import Image from "next/image";

export const UserAvatars = () => {
  return (
    <div className="flex items-center gap-4 mt-6">
      <div className="flex items-center">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white">
          <Image
            src="/images/avatars/avatar1.jpg"
            alt="User 1"
            width={400}
            height={400}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white -ml-3">
          <Image
            src="/images/avatars/avatar2.jpg"
            alt="User 2"
            width={400}
            height={400}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white -ml-3">
          <Image
            src="/images/avatars/avatar3.jpg"
            alt="User 3"
            width={400}
            height={400}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white -ml-3">
          <Image
            src="/images/avatars/avatar4.jpg"
            alt="User 4"
            width={400}
            height={400}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      <span className="text-sm text-white font-medium">
        517.69 million+ <br /> Spotify users worldwide
      </span>
    </div>
  );
};
