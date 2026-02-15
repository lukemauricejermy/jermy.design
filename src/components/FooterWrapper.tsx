"use client";

import { useRef, useEffect } from "react";

const FOOTER_HEIGHT_VAR = "--footer-height";

export function FooterWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setHeight = () => {
      const height = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty(FOOTER_HEIGHT_VAR, `${height}px`);
    };

    setHeight();

    const observer = new ResizeObserver(setHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={ref} className={className}>
      {children}
    </footer>
  );
}
