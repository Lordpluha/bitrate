import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
  const [src, setSrc] = useState("/images/logo.png");

  return (
    <Link href="/" aria-label="Spotify Home" className="inline-block">
      <Image
        src={src}
        onError={() => setSrc("/images/logo.webp")}
        width={111}
        height={36}
        alt="Spotify logo"
        loading="lazy"
      />
    </Link>
  );
};
