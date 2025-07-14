import { GreyBlock } from "@widgets/GreyBlock";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer>
      <GreyBlock>
      <div className="container">
        <div className="grid grid-cols-[1fr_3fr_1fr] items-start max-md:grid-cols-1 max-md:gap-8 max-md:py-10">
          <div>
            <Image
              src={"/images/footer-logo.png"}
              alt=""
              width={111}
              height={36}
            />
          </div>
          <div className="grid gap-5 grid-cols-3 max-sm:grid-cols-1">
            <div>
              <ul className="flex flex-col items-start gap-2 text-lg">
                <li>
                  <Link href={"#"}>Company</Link>
                </li>
                <li>
                  <Link href={"#"}>About</Link>
                </li>
                <li>
                  <Link href={"#"}>Jobs</Link>
                </li>
                <li>
                  <Link href={"#"}>For the record</Link>
                </li>
              </ul>
            </div>
            <div>
              <ul className="flex flex-col items-start gap-2 text-lg">
                <li>
                  <Link href={"#"}>Company</Link>
                </li>
                <li>
                  <Link href={"#"}>For Artists</Link>
                </li>
                <li>
                  <Link href={"#"}>Developers</Link>
                </li>
                <li>
                  <Link href={"#"}>Advertising</Link>
                </li>
                <li>
                  <Link href={"#"}>Investors</Link>
                </li>
                <li>
                  <Link href={"#"}>Vendors</Link>
                </li>
              </ul>
            </div>
            <div>
              <ul className="flex flex-col items-start gap-2 text-lg">
                <li>
                  <Link href={"#"}>Company</Link>
                </li>
                <li>
                  <Link href={"#"}>Support</Link>
                </li>
                <li>
                  <Link href={"#"}>Web Player</Link>
                </li>
                <li>
                  <Link href={"#"}>Free Mobile App</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end gap-12 max-sm:justify-start">
            <Link href={"#"}>
              <Image src={"/icons/inst.svg"} alt="" height={32} width={32} />
            </Link>
            <Link href={"#"}>
              <Image src={"/icons/twit.svg"} alt="" height={32} width={32} />
            </Link>
            <Link href={"#"}>
              <Image
                src={"/icons/facebook.svg"}
                alt=""
                height={28}
                width={16}
              />
            </Link>
          </div>
        </div>
      </div>
      </GreyBlock>

    </footer>
  );
};

export default Footer;
