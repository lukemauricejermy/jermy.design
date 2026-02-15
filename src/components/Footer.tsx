import { performRequest } from "@/lib/datocms";
import Link from "next/link";
import { FooterWrapper } from "@/components/FooterWrapper";
import { FooterLinksMobile } from "@/components/FooterLinksMobile";
import { H1, Lead, P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { FadeUp, StaggerChildren } from "@/components/animations";
import {
  animationDurations,
  animationEasings,
  animationDistances,
  animationDelays,
} from "@/lib/animation-config";
import { Linkedin, Dribbble, Github } from "lucide-react";

const CASE_STUDIES_QUERY = `
  query CaseStudies {
    allCaseStudies {
      id
      title
      slug
    }
  }
`;

type CaseStudy = {
  id: string;
  title: string;
  slug: string;
};

type QueryResult = {
  allCaseStudies: CaseStudy[];
};

const MENU_LINKS = [
  { label: "Home", href: "/" },
  { label: "Cases", href: "/work" },
  { label: "About me", href: "/about" },
  { label: "Work history", href: "/work-history" },
];

const LEGAL_LINKS = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
];

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "Dribbble", href: "https://dribbble.com", icon: Dribbble },
  { label: "GitHub", href: "https://github.com", icon: Github },
];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <P className="text-sm font-medium text-muted-foreground">{title}</P>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-base text-foreground hover:underline transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default async function Footer() {
  let caseStudies: CaseStudy[] = [];
  try {
    const { allCaseStudies } = await performRequest<QueryResult>({
      query: CASE_STUDIES_QUERY,
    });
    caseStudies = allCaseStudies ?? [];
  } catch {
    caseStudies = [];
  }

  const caseStudyLinks = caseStudies.map(({ id, title, slug }) => ({
    label: title,
    href: `/work/${slug}`,
  }));

  return (
    <FooterWrapper className="fixed bottom-0 left-0 right-0 -z-10 bg-secondary border-t border-border py-12 md:py-40 px-6">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-12 md:gap-40">
        {/* Top row: Intro + CTA left, Link columns right */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 md:gap-16 lg:gap-24">
          <div className="flex flex-col gap-6 max-w-xl">
            <FadeUp
              triggerOnScroll
              delay={0}
              duration={animationDurations.default}
              distance={animationDistances.default}
              easing={animationEasings.smooth}
            >
              <Lead className="text-base md:text-lg leading-6 md:leading-7 text-foreground">
                If you&apos;ve seen something here that tickles your fancy, be
                sure to reach out and let&apos;s grab a coffee - I&apos;m always
                happy to talk about how to put the world to rights.
              </Lead>
            </FadeUp>
            <FadeUp
              triggerOnScroll
              delay={animationDelays.short}
              duration={animationDurations.default}
              distance={animationDistances.default}
              easing={animationEasings.smooth}
            >
              <Button asChild size="lg" className="w-fit">
                <Link href="/contact">Get in touch</Link>
              </Button>
            </FadeUp>
          </div>

          <FooterLinksMobile
            menuLinks={MENU_LINKS}
            caseStudyLinks={caseStudyLinks}
            legalLinks={LEGAL_LINKS}
          />
          <StaggerChildren
            triggerOnScroll
            delayStart={animationDelays.short}
            delayBetween={80}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
            className="hidden md:flex flex-col sm:flex-row gap-12 sm:gap-16 md:gap-24"
          >
            <LinkColumn title="Menu" links={MENU_LINKS} />
            <LinkColumn title="Case studies" links={caseStudyLinks} />
            <LinkColumn title="Legal stuff" links={LEGAL_LINKS} />
          </StaggerChildren>
        </div>

        {/* Bottom row: Large heading left, Copyright + social right */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-12 md:gap-16">
          <FadeUp
            triggerOnScroll
            delay={0}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
            className="overflow-visible pb-2"
          >
            <H1 className="font-sans text-5xl lg:text-7xl leading-none tracking-tight font-medium text-foreground">
              Don&apos;t be a
              <br />
              stranger.
            </H1>
          </FadeUp>

          <FadeUp
            triggerOnScroll
            delay={animationDelays.medium}
            duration={animationDurations.default}
            distance={animationDistances.default}
            easing={animationEasings.smooth}
            className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8"
          >
            <P className="text-sm text-muted-foreground">
              © 2026 jermy.design. All rights reserved.
            </P>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="icon"
                  asChild
                  className="rounded-md"
                >
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                  >
                    <Icon className="size-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </FooterWrapper>
  );
}
