"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle-header";

const navigation = [
  { name: "Cases", href: "/work" },
  { name: "About me", href: "/about" },
  { name: "Work history", href: "/work-history" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
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

            {/* Get in touch button - NOW INSIDE */}
            <Link
              href="/contact"
              className="bg-primary text-primary-foreground h-9 flex items-center justify-center px-4 py-2 rounded-md text-sm leading-5 font-medium hover:opacity-90 transition-opacity"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-card border border-border rounded-2xl shadow-sm p-3">
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
            <div className="pt-2 border-t border-border mt-1">
              <div className="px-4 py-2">
                <ThemeToggle />
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}