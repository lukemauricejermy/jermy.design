"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle-header";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

const navigation: Array<{ name: string; href: string }> = [];

declare global {
  interface Window {
    __preloaderDone?: boolean;
  }
}

export function Header() {
  const bookingLink = "https://calendar.app.google/zyft1akDpn5qg5M48";
  const hasNavigationItems = navigation.length > 0;
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (window.__preloaderDone) {
      setIsPreloaderDone(true);
      return;
    }

    const handlePreloaderDone = () => setIsPreloaderDone(true);
    window.addEventListener("preloader:done", handlePreloaderDone);
    return () => window.removeEventListener("preloader:done", handlePreloaderDone);
  }, []);

  // Handle initial load animation
  useEffect(() => {
    if (!isPreloaderDone) return;

    // Start hidden, then animate in after mount
    setHasLoaded(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [isPreloaderDone]);

  // Handle scroll-based show/hide
  useEffect(() => {
    if (!hasLoaded) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 10;

      // Mark that we've scrolled (no longer initial load)
      if (currentScrollY > 0 && isInitialLoad) {
        setIsInitialLoad(false);
      }

      // Only update if scroll change is significant enough to prevent jitter
      if (Math.abs(currentScrollY - lastScrollY) < scrollThreshold) {
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, hasLoaded, isInitialLoad]);

  // Determine transition properties based on state
  const getTransitionProperties = () => {
    if (!hasLoaded) return "none";
    if (isInitialLoad) {
      // Initial load: animate both transform and opacity
      return "transform 900ms cubic-bezier(0.4, 0, 0.2, 1), opacity 900ms cubic-bezier(0.4, 0, 0.2, 1)";
    }
    // Scroll animations: only transform, no opacity
    return "transform 350ms cubic-bezier(0.4, 0, 0.2, 1)";
  };

  // Determine opacity based on state
  const getOpacity = () => {
    if (!hasLoaded) return "0";
    if (isInitialLoad) {
      return isVisible ? "1" : "0";
    }
    // After initial load, always fully opaque
    return "1";
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-3 py-6 md:px-6"
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        transition: getTransitionProperties(),
        opacity: getOpacity(),
      }}
    >
      <div className="flex items-center justify-between max-w-[1728px] mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="bg-card border border-border flex items-center px-3 py-3 rounded-2xl shadow-sm shrink-0 hover:bg-accent transition-colors"
        >
          <div className="flex h-9 items-center justify-center px-4 py-2 rounded-inner-2xl-gap-3 shrink-0">
            <span className="font-sans text-sm leading-none text-foreground">
              jermy.design
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <div className="bg-card border border-border flex items-center gap-2 px-3 py-3 rounded-2xl shadow-sm">
            {hasNavigationItems && (
              <NavigationMenu viewport={false}>
                <NavigationMenuList className="gap-1">
                  {navigation.map((item) => (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuLink
                        asChild
                        className="h-9 flex items-center justify-center px-4 py-2 rounded-inner-2xl-gap-3 text-sm leading-5 font-medium"
                      >
                        <Link href={item.href}>{item.name}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Book a chat button */}
            <Button asChild variant="default">
              <Link href={bookingLink} target="_blank" rel="noopener noreferrer">
                Book a chat
              </Link>
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          <div className="bg-card border border-border flex gap-2 items-center px-3 py-3 rounded-2xl shadow-sm">
            {/* Theme Toggle - Always visible on mobile */}
            <ThemeToggle />

            {/* Book a chat button */}
            <Button asChild variant="default">
              <Link href={bookingLink} target="_blank" rel="noopener noreferrer">
                Book a chat
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}