"use client";

import { Footer } from "@widgets/Footer";
import { Header } from "@widgets/Header";
import clsx from "clsx";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { PropsWithChildren, useEffect, useState } from "react";

export default function LandingLayout({ children }: PropsWithChildren) {
  const themes = ["dark", "white", "contrast"];

  const [isTheme, setIsTheme] = useState<string>(themes[0] ?? "");

  useEffect(() => {
    const className = `theme-${isTheme}`;
    const root = document.documentElement;

    root.classList.remove("theme-white", "theme-contrast", "theme-dark");
    root.classList.add(className);
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
