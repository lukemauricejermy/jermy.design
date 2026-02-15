"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [localIsDark, setLocalIsDark] = useState(false);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    // Use resolvedTheme to get the actual theme being used (resolves "system" to "light" or "dark")
    if (resolvedTheme) {
      // Only sync if we're not currently animating
      if (!isAnimatingRef.current) {
        setLocalIsDark(resolvedTheme === "dark");
      }
    }
    // Fade in after mount, matching header timing
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [resolvedTheme]);

  if (!mounted) {
    return (
      <div className="bg-muted flex h-9 items-center p-[3px] rounded-lg">
        <div className="size-4" />
      </div>
    );
  }

  // Use resolvedTheme to determine if dark mode is active
  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    if (isAnimatingRef.current) return; // Prevent double-clicks during animation
    
    const newTheme = isDark ? "light" : "dark";
    isAnimatingRef.current = true;
    
    // Update local state immediately to trigger animation
    setLocalIsDark(newTheme === "dark");
    
    // Use double requestAnimationFrame to ensure browser sees the change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTheme(newTheme);
        // Reset animation flag after transition completes
        setTimeout(() => {
          isAnimatingRef.current = false;
        }, 320);
      });
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className="bg-muted flex h-9 items-center p-[3px] rounded-lg relative cursor-pointer hover:opacity-90 transition-opacity"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 900ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sliding indicator - matches active button dimensions exactly from Figma */}
      {/* Left button: starts at 3px, Right button: starts at 50% */}
      <div
        className="absolute bg-card border border-border rounded-inner-lg-gap-3px shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
        style={{ 
          width: "calc(50% - 3px)",
          height: "calc(100% - 6px)",
          top: "3px",
          left: localIsDark ? "50%" : "3px",
          transition: "left 320ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "left"
        }}
      />
      
      {/* Icons - matches Figma structure exactly with p-2 (8px) padding, h-full */}
      <div className="relative flex items-center w-full h-full z-10">
        {/* Sun button area - matches Figma button structure */}
        <div className="flex-1 flex items-center justify-center p-2 rounded-inner-lg-gap-3px h-full">
          <Sun className={`size-4 ${!isDark ? "text-foreground" : "text-muted-foreground"}`} />
        </div>
        {/* Moon button area - matches Figma button structure */}
        <div className="flex-1 flex items-center justify-center p-2 rounded-inner-lg-gap-3px h-full">
          <Moon className={`size-4 ${isDark ? "text-foreground" : "text-muted-foreground"}`} />
        </div>
      </div>
    </button>
  );
}
