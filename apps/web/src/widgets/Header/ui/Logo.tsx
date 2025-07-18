import Image from "next/image";
import Link from "next/link";

export const Logo = () => (
  <Link href="/">
    <Image src="/images/logo.png" width={111} height={36} alt="spotify logo" />
  </Link>
);
