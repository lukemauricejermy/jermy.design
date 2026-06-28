"use client";

import { StructuredText, renderNodeRule } from "react-datocms";
import type { StructuredTextGraphQlResponse } from "react-datocms";
import { P } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

interface RichTextProps {
  data: StructuredTextGraphQlResponse | null;
  className?: string;
}

export function RichText({ data, className }: RichTextProps) {
  if (!data) return null;

  return (
    <div className={cn(className)}>
      <StructuredText
        data={data}
        customNodeRules={[
          // Render paragraphs with the shared typography <P> component so body
          // copy is consistent everywhere (overview + callouts) and driven by
          // the design system rather than ad-hoc utilities. whitespace-pre-line
          // preserves authored soft line breaks.
          renderNodeRule(
            (node) => node.type === "paragraph",
            ({ children, key }) => (
              <P key={key} className="whitespace-pre-line">
                {children}
              </P>
            )
          ),
        ]}
      />
    </div>
  );
}
