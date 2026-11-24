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
  plocka: {
    "Three layers of “where you are”": [
      {
        "kind": "phones",
        "label": "Plocka setup",
        "wide": true,
        "bg": "#03A14A",
        "screens": [
          {
            "url": "/images/cases/plocka-v1/screens/soil-v3.webp",
            "alt": "The soil read for a spot in Malax: clay loam, acidic, pH 5.2",
            "width": 1170,
            "height": 2532
          },
          {
            "url": "/images/cases/plocka-v1/screens/plan-v3.webp",
            "alt": "Your plan: six beds and eleven crops laid out, with why it's laid out like this",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/crops-v3.webp",
            "alt": "Good picks for your soil: strawberry is easy here, tomato a little trickier",
            "width": 1170,
            "height": 2532
          }
        ]
      }
    ],
    "Tasks you can actually follow": [
      {
        "kind": "phones",
        "label": "Plocka tasks",
        "wide": true,
        "bg": "#FEF8E8",
        "screens": [
          {
            "url": "/images/cases/plocka-v1/screens/tasks-list-v3.webp",
            "alt": "Tasks: overdue first, then your ground, with jobs waiting for the snow to go",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/task-drawer-v3.webp",
            "alt": "A task opened: spread compost on the bed, what you need and how to do it in steps",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/grow-tasks-v3.webp",
            "alt": "This week's tasks on Grow, under the conditions",
            "width": 750,
            "height": 1624
          }
        ]
      },
      {
        "kind": "browser",
        "label": "Plocka task review",
        "bg": "#03A14A",
        "screen": {
          "url": "/images/cases/plocka-v1/screens/debug-steps-v3.webp",
          "alt": "The task review page: every step picture, marked good or redo",
          "width": 1600,
          "height": 1075
        }
      },
      {
        "kind": "browser",
        "label": "Plocka task timeline",
        "bg": "#051409",
        "screen": {
          "url": "/images/cases/plocka-v1/screens/debug-tasks-v3.webp",
          "alt": "The task timeline for a growing year, with frost dates and what each job waits for",
          "width": 1600,
          "height": 1075
        }
      }
    ],
    "Grow: everything at a glance": [
      {
        "kind": "phones",
        "label": "Plocka Grow setup",
        "wide": true,
        "bg": "#F2EE6A",
        "fg": "#051409",
        "screens": [
          {
            "url": "/images/cases/plocka-v1/screens/setup-new-v3.webp",
            "alt": "Getting started: the growing space is set up, next is turning on tasks",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/setup-signedin-v3.webp",
            "alt": "Getting started: tasks on, last step is telling Plocka where you're at",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/setup-week-v3.webp",
            "alt": "Set up: the week's headline, things to sort and where you are in the season",
            "width": 750,
            "height": 1624
          }
        ]
      },
      {
        "kind": "phones",
        "label": "Plocka Grow weather",
        "wide": true,
        "bg": "#FEF8E8",
        "screens": [
          {
            "url": "/images/cases/plocka-v1/screens/grow-snow-v3.webp",
            "alt": "Grow on a snowy day, the garden under snow",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/grow-frost-v3.webp",
            "alt": "A cloudy day with a frost warning: cover anything tender",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/grow-storm-v3.webp",
            "alt": "Grow at night in a thunderstorm",
            "width": 750,
            "height": 1624
          }
        ]
      },
      {
        "kind": "phones",
        "label": "Plocka Grow weeks",
        "wide": true,
        "bg": "#03A14A",
        "screens": [
          {
            "url": "/images/cases/plocka-v1/screens/grow-quiet-v3.webp",
            "alt": "A quiet week in the beds",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/grow-sowing-v3.webp",
            "alt": "Sowing season: this week is all about sourcing seeds, plants and kit",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/grow-tasks-v3.webp",
            "alt": "This week's tasks, with conditions above: soil too cold to sow, frost tonight",
            "width": 750,
            "height": 1624
          }
        ]
      },
      {
        "kind": "phones",
        "label": "Plocka Grow dark",
        "wide": true,
        "bg": "#051409",
        "screens": [
          {
            "url": "/images/cases/plocka-v1/screens/dark-snow-v4.webp",
            "alt": "Dark theme: snowing at night",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/dark-quiet-v3.webp",
            "alt": "Dark theme: a quiet week in the beds",
            "width": 750,
            "height": 1624
          },
          {
            "url": "/images/cases/plocka-v1/screens/dark-tasks-v3.webp",
            "alt": "Dark theme: conditions and this week's tasks",
            "width": 750,
            "height": 1624
          }
        ]
      }
    ]
  },
};
