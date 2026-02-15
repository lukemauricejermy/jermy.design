"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type LinkItem = { label: string; href: string };

function FooterLinkDropdown({
  title,
  links,
}: {
  title: string;
  links: LinkItem[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full justify-between text-left">
        {title}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-popper-anchor-width)]">
        {links.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FooterLinksMobile({
  menuLinks,
  caseStudyLinks,
  legalLinks,
}: {
  menuLinks: LinkItem[];
  caseStudyLinks: LinkItem[];
  legalLinks: LinkItem[];
}) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      <FooterLinkDropdown title="Menu" links={menuLinks} />
      <FooterLinkDropdown title="Case studies" links={caseStudyLinks} />
      <FooterLinkDropdown title="Legal stuff" links={legalLinks} />
    </div>
  );
}
