"use client";

import Image from "next/image";
import { AuthButtons } from "./ui/AuthButtons";
import { Logo } from "./ui/Logo";
import { NavLinks } from "./ui/NavLinks";
import { useEffect, useState } from "react";
import { AlignJustify, X } from "lucide-react";
import clsx from "clsx";
import styles from "./Header.module.css";
import { ThemeSwitcher } from "@features/SwitchTheme";


type HeaderProps = {
  themes: string[];
  isTheme: string;
  setIsTheme: React.Dispatch<React.SetStateAction<string>>;
};

export const Header = ({ themes, isTheme, setIsTheme }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNav, setIsNavActive] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onNavToggle = () => setIsNavActive((prev) => !prev);

  return (
    <header
      className={clsx(styles.header, isScrolled && styles.headerScrolled)}
    >
      <div className={clsx(styles.inner, "container")}>
        <Logo />
        <nav className={styles.nav}>
          <ul
            className={clsx(
              styles.navList,
              styles.mobileLayout,
              styles.mobileFlex,
              isNav && styles.mobileActive,
            )}
          >
            <NavLinks />
             <ThemeSwitcher themes={themes} isTheme={isTheme} setIsTheme={setIsTheme} />
            <AuthButtons />
          </ul>
          <div onClick={onNavToggle} className={styles.burger}>
            {isNav ? <X size={40} /> : <AlignJustify size={40} />}
          </div>
        </nav>
      </div>
    </header>
  );
};
