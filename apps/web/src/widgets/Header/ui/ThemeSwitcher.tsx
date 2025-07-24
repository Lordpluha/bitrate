import { log } from "console";
import React, { useState } from "react";

type ThemeSwitcherProps = {
  themes: string[];
  isTheme: string;
  setIsTheme: React.Dispatch<React.SetStateAction<string>>;
};

const ThemeSwitcher = ({ themes, isTheme, setIsTheme }: ThemeSwitcherProps) => {
  return (
    <div>
      ThemeSwitcher: <strong>{isTheme}</strong>
      <div>
        {themes.map((t) => (
          <div className="cursor-pointer" key={t} onClick={() => setIsTheme(t)}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
