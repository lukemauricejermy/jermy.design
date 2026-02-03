"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="fixed top-6 right-6 z-50 p-2 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
        aria-label="Toggle theme"
      >
        <div className="size-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-6 right-6 z-50 p-2 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Sun className="size-5 text-foreground" />
      ) : (
        <Moon className="size-5 text-foreground" />
      )}
    </button>
  );
}
