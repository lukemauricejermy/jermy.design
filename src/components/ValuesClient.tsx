"use client";

import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import Link from "next/link";
import { StructuredText } from "react-datocms";
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

/** DatoCMS Structured Text field – matches StructuredText data prop */
export type StructuredTextData = React.ComponentProps<typeof StructuredText>["data"];

type ValueWithSvg = {
  id: string;
  title: string;
  key: string;
  description: StructuredTextData;
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
          "overflow-hidden flex flex-col h-full transition-shadow hover:shadow-md border border-border rounded-3xl shadow-sm p-8 cursor-pointer"
        )}
        onClick={onClick}
      >
        {/* Illustration - scales with card width, max 388×388 — identical styling to modal for seamless swap */}
        <div
          data-illustration
          className="flex-shrink-0 w-full max-w-[388px] aspect-square mx-auto [&_svg]:w-full [&_svg]:h-full [&_svg]:object-contain flex items-center justify-center transition-none"
        >
          <ValueIllustration svgContent={value.svgContent} className="w-full h-full" />
        </div>
        {/* Title BELOW illustration — data-collapsed-title for post-unmount animation */}
        <CardHeader className="flex-1 flex items-end pb-0 pt-8 px-0 text-left min-h-0">
          <H3 data-collapsed-title className="text-2xl md:text-3xl leading-none tracking-tight font-medium">
            {value.title}
          </H3>
        </CardHeader>
      </Card>
    </div>
  );
});

// Illustration dimensions: desktop 388x388, mobile 320x280
const ILLUSTRATION_W_DESKTOP = 388;
const ILLUSTRATION_H_DESKTOP = 388;
const ILLUSTRATION_W_MOBILE = 320;
const ILLUSTRATION_H_MOBILE = 280;

// Expanded modal card: desktop = landscape (illustration LEFT, content RIGHT); mobile = stacked (illustration TOP, content BELOW)
function ExpandedValueCard({
  value,
  illustrationRef,
  collapsedTitleRef,
  expandedContentRef,
  showExpandedContent,
  isMobile,
}: {
  value: ValueWithSvg;
  illustrationRef: React.RefObject<HTMLDivElement | null>;
  collapsedTitleRef: React.RefObject<HTMLDivElement | null>;
  expandedContentRef: React.RefObject<HTMLDivElement | null>;
  showExpandedContent: boolean;
  isMobile: boolean;
}) {
  const illustrationW = isMobile ? ILLUSTRATION_W_MOBILE : ILLUSTRATION_W_DESKTOP;
  const illustrationH = isMobile ? ILLUSTRATION_H_MOBILE : ILLUSTRATION_H_DESKTOP;
  const isStacked = isMobile;

  return (
    <Card
      className={cn(
        "isolate overflow-hidden h-full w-full border border-border rounded-3xl shadow-sm p-8 relative",
        isStacked ? "flex flex-col" : "flex flex-row"
      )}
    >
      {/* Illustration - absolute, position animated by GSAP — identical styling to card for seamless swap */}
      <div
        ref={illustrationRef}
        data-illustration
        data-mobile={isMobile}
        className="absolute [&_svg]:w-full [&_svg]:h-full [&_svg]:object-contain flex items-center justify-center transition-none"
        style={{ width: illustrationW, height: illustrationH, zIndex: 0 }}
      >
        <ValueIllustration svgContent={value.svgContent} className="w-full h-full" />
      </div>
      {/* Collapsed title - absolute bottom, fades out during expand. Match ValueCard's leading-tight exactly to avoid jump. */}
      <div
        ref={collapsedTitleRef}
        className="absolute bottom-8 left-8 right-8 min-h-[2.5rem] text-left [contain:layout]"
      >
        <H3 className="text-2xl md:text-3xl leading-none tracking-tight font-medium">{value.title}</H3>
      </div>
      {/* Expanded content - right side on desktop, below illustration on mobile */}
      {showExpandedContent && (
        <div
          ref={expandedContentRef}
          className={cn(
            "relative flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto",
            isStacked ? "mt-0 px-0" : "justify-center pl-[420px] pr-8"
          )}
          style={{
            zIndex: 10,
            ...(isStacked && {
              paddingTop: ILLUSTRATION_H_MOBILE + 32,
            }),
          }}
        >
          <H3
            id="value-modal-title"
            className="text-3xl md:text-4xl leading-none tracking-tight font-medium overflow-hidden"
          >
            <TextReveal triggerOnScroll={false} delay={0} duration={600} stagger={0.015} easing={animationEasings.robust}>
              {value.title}
            </TextReveal>
          </H3>
          {value.description && (
            <FadeUp
              triggerOnScroll={false}
              delay={animationDelays.medium}
              duration={animationDurations.default}
            >
              <div className="text-base leading-6 text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0">
                <StructuredText data={value.description} />
              </div>
            </FadeUp>
          )}
        </div>
      )}
    </Card>
  );
}

// Expanded card dimensions - larger than collapsed for takeover feel (Figma: 920px max-width)
const EXPANDED_WIDTH = 920;
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
    // Illustration: start at card's exact position and size (captured before state change for sub-pixel precision)
    // Use card illustration's actual dimensions (can be smaller than 388 when card scales)
    const startW = cardIllustrationRect?.width ?? (isMobile ? 388 : ILLUSTRATION_W_DESKTOP);
    const startH = cardIllustrationRect?.height ?? (isMobile ? 388 : ILLUSTRATION_H_DESKTOP);
    if (illustration && cardIllustrationRect && rect) {
      const startLeft = cardIllustrationRect.left - rect.left;
      const startTop = cardIllustrationRect.top - rect.top;
      gsap.set(illustration, {
        top: 0,
        left: 0,
        x: startLeft,
        y: startTop,
        width: startW,
        height: startH,
      });
    } else if (illustration && rect) {
      const left = Math.max(0, (rect.width - 64 - startW) / 2);
      gsap.set(illustration, {
        top: 32,
        left,
        x: 0,
        y: 0,
        width: startW,
        height: startH,
      });
    }

    // Freeze collapsed title width to prevent reflow/jump as card expands (titles break onto 2 lines)
    if (collapsedTitle) {
      const titleWidth = rect.width - 64; // matches left-8 + right-8
      gsap.set(collapsedTitle, { opacity: 1, y: 0, width: titleWidth, maxWidth: titleWidth });
    }

    const expandW = isMobile
      ? (typeof window !== "undefined" ? window.innerWidth - 32 : 360)
      : EXPANDED_WIDTH;
    const expandH = isMobile
      ? Math.min(85 * 0.01 * (typeof window !== "undefined" ? window.innerHeight : 700), 800)
      : EXPANDED_HEIGHT;

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

    // 1. Title fades out instantly when card is selected
    tl.to(collapsedTitle, {
      opacity: 0,
      y: -10,
      duration: 0.1,
      ease: animationEasings.smooth,
    });
    // 2. Scrim + card expand + illustration — run after title is gone
    tl.to(
      scrim,
      {
        opacity: 1,
        duration: animationDurations.fast / 1000,
        ease: animationEasings.smooth,
      },
      "+=0"
    );
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
    if (illustration) {
      tl.to(
        illustration,
        isMobile
          ? {
              left: "50%",
              x: "-50%",
              top: 32,
              y: 0,
              width: ILLUSTRATION_W_MOBILE,
              height: ILLUSTRATION_H_MOBILE,
              duration: animationDurations.default / 1000,
              ease: animationEasings.smooth,
            }
          : {
              left: 32,
              x: 0,
              top: "50%",
              y: "-50%",
              duration: animationDurations.default / 1000,
              ease: animationEasings.smooth,
            },
        "-=0.6"
      );
    }

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

    // 4. Illustration moves back to top-center of card (same time as card resize)
    // Use card illustration's actual position AND size so modal ends exactly where card sits (no jump)
    const gridCard = id ? cardRefs.current.get(id) : null;
    const cardIllustrationEl = gridCard?.querySelector("[data-illustration]");
    const cardIllustrationRect = cardIllustrationEl?.getBoundingClientRect();
    const closeIllVars: gsap.TweenVars = {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: animationEasings.smooth,
      clearProps: "transform",
    };
    // Always animate to card's actual dimensions (can be scaled on both desktop and mobile)
    if (cardIllustrationRect) {
      (closeIllVars as Record<string, unknown>).width = cardIllustrationRect.width;
      (closeIllVars as Record<string, unknown>).height = cardIllustrationRect.height;
    }
    if (illustration && rect && cardIllustrationRect) {
      const finalLeft = cardIllustrationRect.left - rect.left;
      const finalTop = cardIllustrationRect.top - rect.top;
      tl.to(illustration, { ...closeIllVars, left: finalLeft, top: finalTop }, 0.4);
    } else if (illustration && rect) {
      const finalLeft = 32 + Math.max(0, (rect.width - 64 - 388) / 2);
      tl.to(
        illustration,
        { ...closeIllVars, left: finalLeft, top: 32 },
        0.4
      );
    } else if (illustration) {
      tl.to(
        illustration,
        { ...closeIllVars, left: "50%", x: "-50%", top: 32 },
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
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
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
          isMobile={isMobile}
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
            className="rounded-inner-gap-4"
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-background py-56 px-6">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-16">
        <div className="flex flex-col gap-6 max-w-2xl">
          <H2 className="text-4xl md:text-5xl lg:text-[60px] leading-none tracking-tight border-none pb-0 overflow-hidden">
            <TextReveal
              triggerOnScroll={true}
              delay={0}
              duration={750}
              stagger={0.015}
              easing={animationEasings.robust}
            >
              {`Let's talk about values`}
            </TextReveal>
          </H2>
          <FadeUp
            triggerOnScroll={true}
            delay={animationDelays.short}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
          >
            <Lead className="text-xl leading-7">
              There&apos;s a core set of principles that guide how I work — part
              manifesto, part checklist. They&apos;re what I return to when I need
              to sense-check decisions and stay true to myself.
            </Lead>
          </FadeUp>
          <FadeUp
            triggerOnScroll={true}
            delay={animationDelays.medium}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
          >
            <Lead className="text-xl leading-7">
              If you know me, you&apos;ve probably heard these before.
            </Lead>
          </FadeUp>
          <FadeUp
            triggerOnScroll={true}
            delay={animationDelays.long}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
          >
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
                  ? "invisible opacity-0 pointer-events-none transition-none"
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
