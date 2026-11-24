// Framed showcases of real screens for a case's highlights, keyed by case
// slug, then by highlight title as it appears in Dato. Bespoke per case, like
// HERO_ART, because the composition is art direction rather than content.
import type { Showcase } from "@/lib/outcome-case";

export const CASE_SHOWCASES: Record<string, Record<string, Showcase[]>> = {
  elsewhere: {
    "Design all the way to code": [
      {
        "kind": "phones",
        "label": "Sourcewhere · Discover",
        "bg": "#e6e0d6",
        "fg": "#2b2722",
        "screens": [
          {
            "url": "/images/cases/elsewhere-v1/showcase/sw-available.png",
            "alt": "Sourcewhere Available now grid of luxury pieces",
            "width": 428,
            "height": 926
          },
          {
            "url": "/images/cases/elsewhere-v1/showcase/sw-discover.png",
            "alt": "Sourcewhere home: reimagining the way you find",
            "width": 428,
            "height": 926
          },
          {
            "url": "/images/cases/elsewhere-v1/showcase/sw-secure.png",
            "alt": "Sourcewhere personal shopper confirming a pair of Chanel loafers",
            "width": 428,
            "height": 926
          }
        ],
        "wide": true
      },
      {
        "kind": "browser",
        "label": "TechSoup · Explore",
        "bg": "#d6e9f2",
        "fg": "#0b3b52",
        "screen": {
          "url": "/images/cases/elsewhere-v1/showcase/ts-explore.png",
          "alt": "TechSoup explore page: welcome to the place where civil society shares resources",
          "width": 1206,
          "height": 540
        },
        "float": {
          "url": "/images/cases/elsewhere-v1/showcase/ts-poll.png",
          "alt": "TechSoup community poll: help us build the next offer",
          "width": 1076,
          "height": 436
        }
      },
      {
        "kind": "browser",
        "label": "Foundgood · Initiative overview",
        "bg": "#4f5fe8",
        "screen": {
          "url": "/images/cases/elsewhere-v1/showcase/fg-overview.png",
          "alt": "Foundgood initiative overview for rural water security in Ethiopia",
          "width": 1290,
          "height": 930
        }
      },
      {
        "kind": "phones",
        "label": "Sourcewhere · Request",
        "bg": "#2a2420",
        "fg": "#efe8de",
        "screens": [
          {
            "url": "/images/cases/elsewhere-v1/showcase/sw-item.png",
            "alt": "Sourcewhere item details for a Céline tote",
            "width": 428,
            "height": 926
          },
          {
            "url": "/images/cases/elsewhere-v1/showcase/sw-request.png",
            "alt": "Sourcewhere create a request grid",
            "width": 428,
            "height": 926
          }
        ]
      },
      {
        "kind": "browser",
        "label": "TechSoup · Community",
        "bg": "#ffd23f",
        "fg": "#3b2f00",
        "screen": {
          "url": "/images/cases/elsewhere-v1/showcase/ts-community-page.png",
          "alt": "TechSoup communities page with illustrated hero and community cards",
          "width": 1152,
          "height": 840
        }
      }
    ],
  },
};
