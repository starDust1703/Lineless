"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const ICON_SIZE = 18;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isLight = theme === "light";

  return (
    <button
      type="button"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="cursor-pointer hover:text-(--foreground) flex"
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ?
        <Sun
          key="light"
          size={ICON_SIZE}
          className="text-yellow-400 hover:text-yellow-500"
        />
        :
        <Moon
          key="dark"
          size={ICON_SIZE}
          className="text-blue-500 hover:text-blue-600"
        />
      }
    </button>
  );
};

export { ThemeSwitcher };
