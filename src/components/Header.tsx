"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle-header";

const navigation = [
  { name: "Cases", href: "/work" },
  { name: "About me", href: "/about" },
  { name: "Work history", href: "/work-history" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle initial load animation
  useEffect(() => {
    // Start hidden, then animate in after mount
    setHasLoaded(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

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

  // Handle click outside and scroll to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[aria-label="Toggle menu"]')
      ) {
        setMobileMenuOpen(false);
      }
    };

    const handleScroll = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [mobileMenuOpen]);

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
          <div className="flex h-9 items-center justify-center px-4 py-2 rounded-md shrink-0">
            <span className="font-sans text-sm leading-none text-foreground">
              jermy.design
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center">
          <div className="bg-card border border-border flex gap-5 items-center px-3 py-3 rounded-2xl shadow-sm">
            {/* Navigation Links Container - gap-1 (4px) between links */}
            <div className="flex gap-1 items-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="h-9 flex items-center justify-center px-4 py-2 rounded-md text-sm leading-5 font-medium text-foreground hover:bg-accent transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Get in touch button - NOW INSIDE */}
            <Link
              href="/contact"
              className="bg-primary text-primary-foreground h-9 flex items-center justify-center px-4 py-2 rounded-md text-sm leading-5 font-medium hover:opacity-90 transition-opacity"
            >
              Get in touch
            </Link>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          <div className="bg-card border border-border flex gap-2 items-center px-3 py-3 rounded-2xl shadow-sm">
            {/* Theme Toggle - Always visible on mobile */}
            <ThemeToggle />

            {/* Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-secondary text-secondary-foreground h-9 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm leading-5 font-medium hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden mt-4 bg-card border border-border rounded-2xl shadow-sm p-3"
        >
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="h-9 flex items-center px-4 py-2 rounded-md text-sm leading-5 font-medium text-foreground hover:bg-accent transition-colors"
              >
                {item.name}
              </Link>
            ))}
            {/* Get in touch button - Now in the menu */}
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-primary text-primary-foreground h-9 flex items-center justify-center px-4 py-2 rounded-md text-sm leading-5 font-medium hover:opacity-90 transition-opacity mt-3"
            >
              Get in touch
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}