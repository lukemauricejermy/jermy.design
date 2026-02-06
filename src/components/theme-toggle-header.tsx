"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-muted flex h-9 items-center p-[3px] rounded-lg">
        <div className="size-4" />
      </div>
    );
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="bg-muted flex h-9 items-center p-[3px] rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sliding indicator - matches active button dimensions exactly from Figma */}
      {/* Left button: starts at 3px, Right button: starts at 50% */}
      <div
        className="absolute bg-card border border-border rounded-md shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
        style={{ 
          width: "calc(50% - 3px)",
          height: "calc(100% - 6px)",
          top: "3px",
          left: isDark ? "50%" : "3px",
          transitionProperty: "left",
          transitionDuration: "320ms",
          transitionTimingFunction: "ease-in-out"
        }}
      />
      
      {/* Icons - matches Figma structure exactly with p-2 (8px) padding, h-full */}
      <div className="relative flex items-center w-full h-full z-10">
        {/* Sun button area - matches Figma button structure */}
        <div className="flex-1 flex items-center justify-center p-2 rounded-md h-full">
          <Sun className={`size-4 transition-colors duration-[320ms] ${!isDark ? "text-foreground" : "text-muted-foreground"}`} />
        </div>
        {/* Moon button area - matches Figma button structure */}
        <div className="flex-1 flex items-center justify-center p-2 rounded-md h-full">
          <Moon className={`size-4 transition-colors duration-[320ms] ${isDark ? "text-foreground" : "text-muted-foreground"}`} />
        </div>
      </div>
    </button>
  );
}
