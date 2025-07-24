"use client";

import { themes } from "@shared/constants/theme";
import { Footer } from "@widgets/Footer";
import { Header } from "@widgets/Header";
import clsx from "clsx";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { PropsWithChildren, useEffect, useState } from "react";


export default function LandingLayout({ children }: PropsWithChildren) {
  const [isTheme, setIsTheme] = useState<string>(themes[0]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const initialTheme = themes.includes(storedTheme || "") ? storedTheme! : themes[0];
    setIsTheme(initialTheme ?? "");
  }, []);

  useEffect(() => {
    if (!isTheme) return;

    const className = `theme-${isTheme}`;
    const root = document.documentElement;

    root.classList.remove("theme-dark", "theme-contrast", "theme-white");
    root.classList.add(className);

    localStorage.setItem("theme", isTheme);
  }, [isTheme]);

  return (
    <div
      className={clsx("flex flex-col min-h-[100vh] bg-bgPrimary text-tBase")}
    >
      <Header themes={themes} isTheme={isTheme} setIsTheme={setIsTheme} />
      <main>{children}</main>
      <Footer className="mt-auto" />
    </div>
  );
}
