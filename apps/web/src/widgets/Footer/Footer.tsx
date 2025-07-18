import { GreyBlock } from "@widgets/GreyBlock";
import Image from "next/image";
import Link from "next/link";
import { FC, HTMLAttributes } from "react";
import footerLinks from "./config/footerLinks.json";

export type FooterProps = HTMLAttributes<HTMLDivElement>;

type FooterColumn = {
  title: string;
  links: string[];
};

type SocialLink = {
  icon: string;
  alt: string;
  href: string;
};

export const Footer: FC<FooterProps> = (props) => {

  const columns: FooterColumn[] = footerLinks.columns;
  const socials: SocialLink[] = footerLinks.socials;

  return (
    <footer {...props}>
      <GreyBlock>
        <div className="container">
          <div className="grid grid-cols-[1fr_3fr_1fr] items-start max-md:grid-cols-1 max-md:gap-8 max-md:py-10">
            <Link href={"#"} className="transition-[0.3s] hover:opacity-70">
              <Image
                src={"/images/footer-logo.png"}
                alt=""
                width={111}
                height={36}
              />
            </Link>
            <div className="grid gap-5 grid-cols-3 max-sm:grid-cols-1">
              {columns.map((col, i) => (
                <div key={i}>
                  <ul className="flex flex-col items-start gap-2 text-lg">
                    {col.links.map((text, j) => (
                      <li key={j}>
                        <Link className="transition-[0.3s] hover:opacity-70" href="#">{text}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-12 max-sm:justify-start">
              {socials.map((social, i) => (
                <Link className="transition-[0.3s] hover:opacity-70" href={social.href} key={i}>
                  <Image
                    src={social.icon}
                    alt={social.alt}
                    height={32}
                    width={32}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </GreyBlock>
    </footer>
  );
};
