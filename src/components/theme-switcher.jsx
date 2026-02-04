"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const ICON_SIZE = 18;

  return (
    <button className="cursor-pointer hover:text-(--foreground) outline-none flex">
      {theme === "light" ?
        <Sun
          key="light"
          size={ICON_SIZE}
          className="text-yellow-400 hover:text-yellow-500"
          onClick={() => setTheme('dark')}
        />
        :
        <Moon
          key="dark"
          size={ICON_SIZE}
          className="text-blue-500 hover:text-blue-600"
          onClick={() => setTheme('light')}
        />
      }
    </button>
  );
};

export { ThemeSwitcher };
