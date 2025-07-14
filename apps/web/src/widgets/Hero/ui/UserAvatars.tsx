import Image from "next/image";

const avatars = [
  "/images/avatars/avatar1.jpg",
  "/images/avatars/avatar2.jpg",
  "/images/avatars/avatar3.jpg",
  "/images/avatars/avatar4.jpg",
];

export const UserAvatars = () => {
  return (
    <div className="flex items-center gap-4 mt-6">
      <div className="flex items-center">
        {avatars.map((avatar, index) => (
          <div
            className="w-14 h-14 rounded-full overflow-hidden border-2 border-white -ml-3"
            key={"User " + (index + 1)}
          >
            <Image
              src={avatar}
              alt={"User " + (index + 1)}
              width={50}
              height={50}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
      </div>
      <span className="text-sm text-white font-medium">
        517.69 million+ <br /> Spotify users worldwide
      </span>
    </div>
  );
};
