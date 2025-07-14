"use client";

import Image from "next/image";
import { AuthButtons } from "./ui/AuthButtons";
import { Logo } from "./ui/Logo";
import { NavLinks } from "./ui/NavLinks";
import { useState } from "react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="container">
        <div className=" py-12 flex justify-between items-center">
          <Logo />

          <nav className="nav">
            <ul className="flex items-baseline gap-16">
              <NavLinks />
              <AuthButtons />
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
