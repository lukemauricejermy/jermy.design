"use client";

import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { H2, H3, Lead } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren, TextReveal } from "@/components/animations";
import {
  animationDurations,
  animationEasings,
  animationDistances,
  animationDelays,
} from "@/lib/animation-config";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ValueWithSvg = {
  id: string;
  title: string;
  key: string;
  description: string | null;
  svgContent: string;
};

function ValueIllustration({
  svgContent,
  className,
}: {
  svgContent: string;
  className?: string;
}) {
  if (!svgContent) return null;
  return (
    <div
      className={cn("flex items-center justify-center overflow-hidden", className)}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

// Collapsed card: portrait, illustration TOP, title BELOW
const ValueCard = React.forwardRef<
  HTMLDivElement,
  { value: ValueWithSvg; onClick?: () => void; className?: string; "aria-hidden"?: boolean }
>(function ValueCard({ value, onClick, className, "aria-hidden": ariaHidden }, ref) {
  return (
    <div ref={ref} className={cn("h-full", className)} aria-hidden={ariaHidden}>
      <Card
        className={cn(
          "overflow-hidden flex flex-col h-full transition-shadow hover:shadow-md border border-border rounded-3xl shadow-sm p-6 cursor-pointer"
        )}
        onClick={onClick}
      >
        {/* Illustration - 388x388 on TOP — identical styling to modal for seamless swap */}
        <div
          data-illustration
          className="flex-shrink-0 w-[388px] h-[388px] mx-auto [&_svg]:w-full [&_svg]:h-full [&_svg]:object-contain flex items-center justify-center transition-none"
        >
          <ValueIllustration svgContent={value.svgContent} className="w-full h-full" />
        </div>
        {/* Title BELOW illustration — data-collapsed-title for post-unmount animation */}
        <CardHeader className="flex-1 flex items-end pb-0 pt-6 px-0 text-left min-h-0">
          <H3 data-collapsed-title className="text-4xl leading-normal font-medium">
            {value.title}
          </H3>
        </CardHeader>
      </Card>
    </div>
  );
});

// Expanded modal card: landscape, illustration LEFT, title+description RIGHT
function ExpandedValueCard({
  value,
  illustrationRef,
  collapsedTitleRef,
  expandedContentRef,
  showExpandedContent,
}: {
  value: ValueWithSvg;
  illustrationRef: React.RefObject<HTMLDivElement | null>;
  collapsedTitleRef: React.RefObject<HTMLDivElement | null>;
  expandedContentRef: React.RefObject<HTMLDivElement | null>;
  showExpandedContent: boolean;
}) {
  return (
    <Card className="overflow-hidden flex flex-row h-full w-full border border-border rounded-3xl shadow-sm p-6 relative">
      {/* Illustration - absolute, 388x388, position animated by GSAP — identical styling to card for seamless swap */}
      <div
        ref={illustrationRef}
        data-illustration
        className="absolute w-[388px] h-[388px] [&_svg]:w-full [&_svg]:h-full [&_svg]:object-contain flex items-center justify-center transition-none"
      >
        <ValueIllustration svgContent={value.svgContent} className="w-full h-full" />
      </div>
      {/* Collapsed title - absolute bottom, fades out during expand. min-h reserves space so animation doesn't cause layout shift. */}
      <div
        ref={collapsedTitleRef}
        className="absolute bottom-6 left-6 right-6 min-h-[2.5rem] text-left [contain:layout]"
      >
        <H3 className="text-4xl leading-normal font-medium">{value.title}</H3>
      </div>
      {/* Expanded content - right side, ref for close animation */}
      {showExpandedContent && (
        <div
          ref={expandedContentRef}
          className="flex-1 flex flex-col justify-center pl-[412px] pr-6 gap-4 min-w-0"
        >
          <H3
            id="value-modal-title"
            className="text-4xl leading-normal font-medium overflow-hidden"
          >
            <TextReveal triggerOnScroll={false} delay={0}>
              {value.title}
            </TextReveal>
          </H3>
          {value.description && (
            <FadeUp
              triggerOnScroll={false}
              delay={animationDelays.medium}
              duration={animationDurations.default}
            >
              <p className="text-base leading-6 text-foreground">
                {value.description}
              </p>
            </FadeUp>
          )}
        </div>
      )}
    </Card>
  );
}

// Expanded card dimensions - larger than collapsed for takeover feel
const EXPANDED_WIDTH = 800;
const EXPANDED_HEIGHT = 520;

export default function ValuesClient({ values }: { values: ValueWithSvg[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expansionComplete, setExpansionComplete] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const collapsedTitleRef = useRef<HTMLDivElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);
  const expandedContentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLDivElement>(null);
  const openCardRectRef = useRef<DOMRect | null>(null);
  const openCardIllustrationRectRef = useRef<DOMRect | null>(null);
  const checkMobile = useCallback(() => {
    setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  const handleOpen = useCallback((id: string) => {
    const cardEl = cardRefs.current.get(id);
    if (!cardEl || typeof document === "undefined") return;

    const rect = cardEl.getBoundingClientRect();
    openCardRectRef.current = rect;
    const cardIllustrationEl = cardEl.querySelector<HTMLElement>("[data-illustration]");
    openCardIllustrationRectRef.current = cardIllustrationEl?.getBoundingClientRect() ?? null;

    setExpandedId(id);
    setExpansionComplete(false);
    setShowCloseButton(false);
  }, []);

  // Run expand animation when modal mounts - useLayoutEffect to avoid flash
  useLayoutEffect(() => {
    if (!expandedId) return;

    const rect = openCardRectRef.current;
    if (!rect) return;

    const modalCard = modalCardRef.current;
    const scrim = scrimRef.current;
    const collapsedTitle = collapsedTitleRef.current;

    if (!modalCard || !scrim) return;

    const illustration = illustrationRef.current;

    const cardIllustrationRect = openCardIllustrationRectRef.current;
    const cardEl = cardRefs.current.get(expandedId ?? "");
    const cardIllustrationEl = cardEl?.querySelector<HTMLElement>("[data-illustration]");

    gsap.set(scrim, { opacity: 0 });
    gsap.set(modalCard, {
      opacity: 1,
      position: "fixed",
      top: rect.top,
      left: rect.left,
      x: 0,
      y: 0,
      width: rect.width,
      height: rect.height,
    });
    // Illustration: start at card's exact position (captured before state change for sub-pixel precision)
    if (illustration && cardIllustrationRect && rect) {
      const startLeft = cardIllustrationRect.left - rect.left;
      const startTop = cardIllustrationRect.top - rect.top;
      gsap.set(illustration, {
        top: 0,
        left: 0,
        x: startLeft,
        y: startTop,
      });
    } else if (illustration) {
      const left = Math.max(0, (rect.width - 48 - 388) / 2);
      gsap.set(illustration, {
        top: 24,
        left,
        x: 0,
        y: 0,
      });
    }

    // DEBUG: Log positions at start of open animation
    console.log("Card illustration rect (before open):", cardIllustrationEl?.getBoundingClientRect());
    console.log("Modal illustration rect (after positioned):", illustration?.getBoundingClientRect());
    if (collapsedTitle) {
      gsap.set(collapsedTitle, { opacity: 1, y: 0 });
    }

    const expandW = isMobile ? Math.min(rect.width * 1.5, 400) : EXPANDED_WIDTH;
    const expandH = isMobile ? Math.max(rect.height * 1.2, 500) : EXPANDED_HEIGHT;

    const tl = gsap.timeline({
      onComplete: () => {
        setExpansionComplete(true);
        // Show close button when title + description animations finish
        // FadeUp (description): 400ms delay + 600ms = 1000ms; TextReveal (title): ~900ms + stagger
        const textAnimDone =
          animationDelays.medium + animationDurations.default + 100; // ~1100ms
        setTimeout(() => setShowCloseButton(true), textAnimDone);
      },
    });

    tl.to(scrim, {
      opacity: 1,
      duration: animationDurations.fast / 1000,
      ease: animationEasings.smooth,
    });
    // Card expands from portrait to landscape
    tl.to(
      modalCard,
      {
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
        width: expandW,
        height: expandH,
        duration: animationDurations.default / 1000,
        ease: animationEasings.smooth,
      },
      "-=0.2"
    );
    // Illustration moves from top-center to left, vertically centered
    if (illustration) {
      tl.to(
        illustration,
        {
          left: 24,
          x: 0,
          top: "50%",
          y: "-50%",
          duration: animationDurations.default / 1000,
          ease: animationEasings.smooth,
        },
        "-=0.6"
      );
    }
    // Collapsed title fades out with lift
    tl.to(
      collapsedTitle,
      {
        opacity: 0,
        y: -10,
        duration: animationDurations.fast / 1000,
        ease: animationEasings.smooth,
      },
      "-=0.6"
    );

    return () => {
      const els = [modalCard, scrim, collapsedTitle];
      if (illustration) els.push(illustration);
      gsap.killTweensOf(els);
    };
  }, [expandedId, isMobile]);

  const handleClose = useCallback(() => {
    const id = expandedId;
    if (!id || typeof document === "undefined") return;

    // Use stored rect from when we opened — matches the ValueCard’s layout
    const rect = openCardRectRef.current;

    const modalCard = modalCardRef.current;
    const scrim = scrimRef.current;
    const closeButton = closeButtonRef.current;
    const expandedContent = expandedContentRef.current;
    const illustration = illustrationRef.current;

    if (!modalCard || !scrim) {
      setExpandedId(null);
      setExpansionComplete(false);
      setShowCloseButton(false);
      return;
    }

    const overlay = overlayRef.current;
    const tl = gsap.timeline({
      onComplete: () => {
        const modalIllustration = modalCard?.querySelector<HTMLElement>("[data-illustration]");
        const cardIllustration = gridCard?.querySelector<HTMLElement>("[data-illustration]");
        if (modalIllustration && cardIllustration && gridCard) {
          const modalRect = modalIllustration.getBoundingClientRect();
          const cardRect = cardIllustration.getBoundingClientRect();

          // Calculate the difference and adjust modal illustration to match card exactly
          const diffLeft = modalRect.left - cardRect.left;
          const diffTop = modalRect.top - cardRect.top;
          if (diffLeft !== 0 || diffTop !== 0) {
            const currentLeft = parseFloat(modalIllustration.style.left) || modalRect.left;
            const currentTop = parseFloat(modalIllustration.style.top) || modalRect.top;
            modalIllustration.style.left = `${currentLeft - diffLeft}px`;
            modalIllustration.style.top = `${currentTop - diffTop}px`;
          }
          void modalIllustration.offsetHeight;

          const finalModalRect = modalIllustration.getBoundingClientRect();
          const finalCardRect = cardIllustration.getBoundingClientRect();
          console.log("After adjustment - Modal:", {
            left: finalModalRect.left,
            top: finalModalRect.top,
          });
          console.log("After adjustment - Card:", {
            left: finalCardRect.left,
            top: finalCardRect.top,
          });
          console.log("Final difference:", {
            left: finalModalRect.left - finalCardRect.left,
            top: finalModalRect.top - finalCardRect.top,
          });

          // Prepare grid card title: start hidden so we can animate it in AFTER unmount
          const gridCardTitle = gridCard.querySelector<HTMLElement>("[data-collapsed-title]");
          if (gridCardTitle) {
            gsap.set(gridCardTitle, { opacity: 0, y: 8 });
          }

          // Swap: hide overlay/scrim, position modal illustration, then show card
          overlay && (overlay.style.opacity = "0");
          scrim && (scrim.style.opacity = "0");

          gsap.set(modalIllustration, {
            position: "fixed",
            left: cardRect.left,
            top: cardRect.top,
            width: cardRect.width,
            height: cardRect.height,
            x: 0,
            y: 0,
            zIndex: 60,
            clearProps: "transform",
          });

          // Show card first
          gridCard.style.visibility = "visible";
          gridCard.style.opacity = "1";

          // Force paint
          void gridCard.offsetHeight;

          // Then completely remove modal illustration from rendering
          modalIllustration.style.display = "none";

          const closedId = id;
          // Wait 2 frames then unmount; animate grid card title AFTER unmount
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setExpandedId(null);
              setExpansionComplete(false);
              setShowCloseButton(false);

              setTimeout(() => {
                const card = cardRefs.current.get(closedId);
                const title = card?.querySelector<HTMLElement>("[data-collapsed-title]");
                if (title) {
                  gsap.fromTo(
                    title,
                    { opacity: 0, y: 8 },
                    { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
                  );
                }
              }, 50);
            });
          });
        } else {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setExpandedId(null);
              setExpansionComplete(false);
              setShowCloseButton(false);
            });
          });
        }
      },
    });

    // 1. Close button fades out (0-150ms)
    if (closeButton) {
      tl.to(closeButton, {
        opacity: 0,
        duration: 0.15,
        ease: animationEasings.smooth,
      });
    }

    // 2. Title + description fade out - fade down with translateY (150-400ms)
    if (expandedContent) {
      tl.to(
        expandedContent,
        {
          opacity: 0,
          y: 15,
          duration: 0.25,
          ease: animationEasings.smooth,
        },
        0.15
      );
    }

    // 3. Hide expanded content from DOM, then card resize + reposition (400-800ms)
    tl.add(() => setExpansionComplete(false), 0.4);
    tl.to(
      modalCard,
      {
        top: rect?.top ?? "50%",
        left: rect?.left ?? "50%",
        x: rect ? 0 : "-50%",
        y: rect ? 0 : "-50%",
        width: rect?.width ?? 320,
        height: rect?.height ?? 360,
        duration: 0.4,
        ease: animationEasings.smooth,
      },
      0.4
    );

    // 4. Illustration moves from left (centered) back to top-center (same time as card resize)
    // Use card illustration's actual position so modal ends exactly where card sits (avoids 24px jump from padding)
    const gridCard = id ? cardRefs.current.get(id) : null;
    const cardIllustrationEl = gridCard?.querySelector("[data-illustration]");
    const cardIllustrationRect = cardIllustrationEl?.getBoundingClientRect();
    if (illustration && rect && cardIllustrationRect) {
      const finalLeft = cardIllustrationRect.left - rect.left;
      const finalTop = cardIllustrationRect.top - rect.top;
      tl.to(
        illustration,
        {
          left: finalLeft,
          top: finalTop,
          x: 0,
          y: 0,
          duration: 0.4,
          ease: animationEasings.smooth,
          clearProps: "transform",
        },
        0.4
      );
    } else if (illustration && rect) {
      const finalLeft = 24 + Math.max(0, (rect.width - 48 - 388) / 2);
      tl.to(
        illustration,
        {
          left: finalLeft,
          x: 0,
          top: 24,
          y: 0,
          duration: 0.4,
          ease: animationEasings.smooth,
        },
        0.4
      );
    } else if (illustration) {
      tl.to(
        illustration,
        {
          left: "50%",
          x: "-50%",
          top: 24,
          y: 0,
          duration: 0.4,
          ease: animationEasings.smooth,
        },
        0.4
      );
    }

    // 5. Collapsed title animation removed — now happens AFTER modal unmounts (in onComplete)

    // 6. Scrim fades out (starts 600ms, ends with card animation)
    tl.to(
      scrim,
      {
        opacity: 0,
        duration: 0.2,
        ease: animationEasings.smooth,
      },
      0.6
    );

  }, [expandedId, isMobile]);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (expandedId) {
      document.addEventListener("keydown", onEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [expandedId, handleClose]);

  const expandedValue = expandedId ? values.find((v) => v.id === expandedId) : null;

  const modal = expandedValue && typeof document !== "undefined" && (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal
      aria-labelledby="value-modal-title"
    >
      <div
        ref={scrimRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        ref={modalCardRef}
        className="absolute z-10 overflow-hidden rounded-3xl"
        role="dialog"
      >
        <ExpandedValueCard
          value={expandedValue}
          illustrationRef={illustrationRef}
          collapsedTitleRef={collapsedTitleRef}
          expandedContentRef={expandedContentRef}
          showExpandedContent={expansionComplete}
        />
        {/* Close button - fades in last, positioned in card top-right */}
        <div
          ref={closeButtonRef}
          className={cn(
            "absolute top-4 right-4 z-20 transition-opacity duration-300",
            showCloseButton ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Button
            variant="secondary"
            size="icon-lg"
            onClick={handleClose}
            aria-label="Close"
            type="button"
            className="rounded-lg"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-56 px-6">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-16">
        <div className="flex flex-col gap-6 max-w-2xl">
          <FadeUp triggerOnScroll delay={0} className="overflow-hidden">
            <H2 className="text-4xl md:text-5xl lg:text-[60px] font-semibold leading-none tracking-tight border-none pb-0">
              Let&apos;s talk about values
            </H2>
          </FadeUp>
          <FadeUp
            triggerOnScroll={true}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
            className="flex flex-col gap-6"
          >
            <Lead className="text-xl leading-7">
              There&apos;s a core set of principles that guide how I work — part
              manifesto, part checklist. They&apos;re what I return to when I need
              to sense-check decisions and stay true to myself.
            </Lead>
            <Lead className="text-xl leading-7">
              If you know me, you&apos;ve probably heard these before.
            </Lead>
            <Button variant="secondary" size="lg" asChild className="w-fit">
              <Link href="/about">Read more about me</Link>
            </Button>
          </FadeUp>
        </div>

        <StaggerChildren
          triggerOnScroll={true}
          delayStart={0}
          delayBetween={80}
          duration={animationDurations.default}
          distance={animationDistances.default}
          easing={animationEasings.smooth}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full"
        >
          {values.map((value) => (
            <ValueCard
              key={value.id}
              ref={(el) => {
                if (el) cardRefs.current.set(value.id, el);
              }}
              value={value}
              onClick={() => handleOpen(value.id)}
              className={
                expandedId === value.id
                  ? "opacity-0 pointer-events-none transition-none"
                  : undefined
              }
              aria-hidden={expandedId === value.id}
            />
          ))}
        </StaggerChildren>
      </div>

      {expandedId && createPortal(modal, document.body)}
    </section>
  );
}
