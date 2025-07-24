import React, { JSX } from "react";
import { Sun, Moon, Circle } from "lucide-react";

type ThemeSwitcherProps = {
  themes: string[];
  isTheme: string;
  setIsTheme: React.Dispatch<React.SetStateAction<string>>;
};

export const ThemeSwitcher = ({ themes, isTheme, setIsTheme }: ThemeSwitcherProps) => {
  const icons: Record<string, JSX.Element> = {
    white: <Sun size={16} />,
    dark: <Moon size={16} />,
    contrast: <Circle size={16} />,
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-full bg-muted shadow-inner shadow-tBase">
      {themes.map((theme) => (
        <button
          key={theme}
          onClick={() => setIsTheme(theme)}
          className={`
                      w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300
                      ${isTheme === theme ? "bg-green" : "bg-bgPrimary"}
                    `}
        >
          {icons[theme] || theme.charAt(0).toUpperCase()}
        </button>
      ))}
    </div>
  );
};

