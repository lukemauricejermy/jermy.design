import Link from "next/link";
import Image from "next/image";
import { FooterWrapper } from "@/components/FooterWrapper";
import { H1, Lead, P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/animations";
import {
  animationDurations,
  animationEasings,
  animationDistances,
  animationDelays,
} from "@/lib/animation-config";
import { HugeiconsIcon } from "@hugeicons/react";
import { Linkedin01Icon } from "@hugeicons/core-free-icons";

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/lukejermy/", icon: Linkedin01Icon },
];

export default async function Footer() {
  const bookingLink = "https://calendar.app.google/zyft1akDpn5qg5M48";

  return (
    <FooterWrapper className="fixed bottom-0 left-0 right-0 z-0 overflow-hidden bg-secondary border-t border-border px-6">
      {/* The page's last word: a big statement and one action on the left, the
          character waving goodbye on the right (bookending the hero), then a
          quiet row of small print. One screen tall on desktop. */}
      <div className="relative mx-auto flex max-w-[90rem] flex-col lg:h-svh">
        <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 pt-24 pb-10 md:gap-10 lg:max-w-[55%] lg:py-0">
          <FadeUp
            triggerOnScroll
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
          >
            <H1 className="type-display text-foreground">Coffee&apos;s on me.</H1>
          </FadeUp>
          <FadeUp
            triggerOnScroll
            delay={animationDelays.short}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
            className="flex flex-col gap-8"
          >
            <Lead className="max-w-xl text-foreground">
              Whether it&apos;s a role, a project or a sounding board, I&apos;m
              always up for a chat.
            </Lead>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="w-fit">
                <Link href={bookingLink} target="_blank" rel="noopener noreferrer">
                  Book a chat
                </Link>
              </Button>
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <Button key={label} asChild variant="outline" size="lg" className="w-fit">
                  <Link href={href} target="_blank" rel="noopener noreferrer">
                    <HugeiconsIcon icon={Icon} className="size-4" />
                    {label}
                  </Link>
                </Button>
              ))}
            </div>
          </FadeUp>
        </div>

        <div className="relative z-10 py-6 lg:absolute lg:bottom-0 lg:left-0">
          <P className="type-small text-muted-foreground">
            © 2026 jermy.design. All rights reserved.
          </P>
        </div>

        {/* Character: anchored to the bottom edge, facing the copy, sunk 12%
            below it so the crop lands just under the mug (no over-long tee).
            Night version in dark mode. */}
        <div
          aria-hidden
          className="pointer-events-none relative mx-auto -mb-[12%] aspect-square w-[min(64vw,20rem)] lg:absolute lg:right-0 lg:bottom-0 lg:mx-0 lg:mb-0 lg:h-[min(56svh,38rem)] lg:w-auto lg:translate-y-[12%]"
        >
          <Image
            src="/images/footer/coffee-v1.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 80vw"
            className="object-contain object-bottom transition-opacity duration-300 dark:opacity-0"
          />
          <Image
            src="/images/footer/coffee-v1-dark.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 80vw"
            className="object-contain object-bottom opacity-0 transition-opacity duration-300 dark:opacity-100"
          />
        </div>

      </div>
    </FooterWrapper>
  );
}
