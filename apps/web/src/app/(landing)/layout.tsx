import { Footer } from "@widgets/Footer";
import { Header } from "@widgets/Header";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { PropsWithChildren } from "react";

export default function LandingLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col min-h-[100vh] bg-[#0A0A0A] text-white">
      <Header />
      <main>{children}</main>
      <Footer className="mt-auto" />
    </div>
  );
}
