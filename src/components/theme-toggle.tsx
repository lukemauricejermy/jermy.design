"use client";

import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
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
        <HugeiconsIcon icon={Sun03Icon} className="size-5 text-foreground" />
      ) : (
        <HugeiconsIcon icon={Moon02Icon} className="size-5 text-foreground" />
      )}
    </button>
  );
}
