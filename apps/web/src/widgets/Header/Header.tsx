"use client";

import Image from "next/image";
import { AuthButtons } from "./ui/AuthButtons";
import { Logo } from "./ui/Logo";
import { NavLinks } from "./ui/NavLinks";
import { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import clsx from "clsx";

export const Header = () => {

  const baseHeader =
    "fixed top-0 left-0 right-0 z-50 transition-colors duration-300";
  const scrolledHeader =
    "bg-black/80 backdrop-blur border-b border-white/10";

    const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const mobileLayout = clsx(
    "max-lg:fixed max-lg:top-0 max-lg:right-0 max-lg:bottom-0 " ,
    "max-lg:bg-black max-lg:h-screen max-lg:w-full max-lg:z-10 ",
    "max-lg:left-[-100%] [&.active]:max-lg:left-0")

  const mobileFlex = "max-lg:flex-col max-lg:justify-center";

  const base = "flex items-center gap-16 transition-all duration-300";

  const [nav, setNav] = useState(false);

  return (
    <header className={clsx(baseHeader, scrolled && scrolledHeader)}>
      <div className="container">
        <div className="px-4 py-8 flex justify-between items-center relative">
          <Logo />

          <nav className={clsx("flex items-center gap-16")}>
            <ul
              className={clsx(
                base,
                mobileLayout,
                mobileFlex,
                nav && "active",
              )}
            >
              <NavLinks />
              <AuthButtons />
            </ul>
            <div
              onClick={() => setNav(!nav)}
              className={clsx(
                "text-white hidden max-lg:block max-lg:absolute max-lg:z-20 max-lg:right-0 max-lg:top-12",
              )}
            >
              {nav ?  <AiOutlineClose size={40} /> : <AiOutlineMenu size={40} />}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
