"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  FavouriteIcon,
  Linkedin01Icon,
  Logout01Icon,
  Mail01Icon,
  PaintBrush01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle-header"
import { Code, Specimen, SubSection } from "./layout"

const BUTTON_VARIANTS = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
const BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const
const ICON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const
const BADGE_VARIANTS = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
const ITEM_VARIANTS = ["default", "outline", "muted"] as const

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-center gap-3 md:grid-cols-[7rem_minmax(0,1fr)]">
      <Code>{label}</Code>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

export function ButtonGallery() {
  return (
    <SubSection
      title="Button"
      description="Pill-shaped. Use default for the one primary action per view, outline or secondary alongside it, ghost in dense UI."
    >
      <Specimen className="flex flex-col gap-5 overflow-x-auto">
        {BUTTON_VARIANTS.map((variant) => (
          <Row key={variant} label={variant}>
            {BUTTON_SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {size === "default" ? "Book a chat" : size}
              </Button>
            ))}
          </Row>
        ))}
        <Separator />
        <Row label="with icon">
          <Button>
            <HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" />
            Book a chat
          </Button>
          <Button variant="outline">
            View case study
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
          <Button variant="secondary">
            <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" />
            Download CV
          </Button>
        </Row>
        <Row label="icon sizes">
          {ICON_SIZES.map((size) => (
            <Button key={size} size={size} variant="outline" aria-label={size}>
              <HugeiconsIcon icon={Add01Icon} />
            </Button>
          ))}
        </Row>
        <Row label="disabled">
          <Button disabled>Book a chat</Button>
          <Button variant="outline" disabled>
            Book a chat
          </Button>
        </Row>
      </Specimen>
    </SubSection>
  )
}

export function BadgeGallery() {
  return (
    <SubSection title="Badge" description="Status, tags and metadata. Not for actions.">
      <Specimen className="flex flex-col gap-5">
        <Row label="variants">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </Row>
        <Row label="sizes">
          <Badge variant="secondary">default</Badge>
          <Badge variant="secondary" size="lg">
            lg
          </Badge>
          <Badge variant="outline" size="lg">
            2024
          </Badge>
          <Badge size="lg">
            <HugeiconsIcon icon={PaintBrush01Icon} data-icon="inline-start" />
            Product design
          </Badge>
        </Row>
        <Row label="with icon">
          <Badge variant="secondary">
            <HugeiconsIcon icon={PaintBrush01Icon} data-icon="inline-start" />
            Product design
          </Badge>
          <Badge variant="outline">
            2024
          </Badge>
          <Badge>
            Coming soon
            <HugeiconsIcon icon={ArrowUpRight01Icon} data-icon="inline-end" />
          </Badge>
        </Row>
      </Specimen>
    </SubSection>
  )
}

export function CardGallery() {
  return (
    <SubSection
      title="Card"
      description="Soft shadow and a hairline ring. Two densities: default (24px padding) and sm (16px)."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vemi</CardTitle>
            <CardDescription>
              MVP mobile app for the UK’s freshest new ethical bank.
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">Fintech</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="type-body text-muted-foreground">
              Cross-functional product squad, from discovery to launch in nine months.
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">
              View case study
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </Button>
            <Button size="sm" variant="ghost">
              Share
            </Button>
          </CardFooter>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>size=&quot;sm&quot;</CardTitle>
            <CardDescription>Tighter spacing for dense layouts.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="type-body text-muted-foreground">
              Same anatomy: header, title, description, action, content, footer.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline">
              Action
            </Button>
          </CardFooter>
        </Card>
      </div>
    </SubSection>
  )
}

export function ItemGallery() {
  return (
    <SubSection
      title="Item"
      description="A row of media, content and actions. Used for case study info chips and score groups."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {ITEM_VARIANTS.map((variant) => (
          <Specimen key={variant} label={`variant="${variant}"`} className="p-3">
            <ItemGroup>
              <Item variant={variant}>
                <ItemMedia variant="icon">
                  <HugeiconsIcon icon={UserIcon} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Role</ItemTitle>
                  <ItemDescription>Lead product designer</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button size="icon-sm" variant="ghost" aria-label="Copy">
                    <HugeiconsIcon icon={Copy01Icon} />
                  </Button>
                </ItemActions>
              </Item>
              <Item variant={variant} size="sm">
                <ItemContent>
                  <ItemTitle>size=&quot;sm&quot;</ItemTitle>
                </ItemContent>
              </Item>
              <Item variant={variant} size="xs">
                <ItemContent>
                  <ItemTitle>size=&quot;xs&quot;</ItemTitle>
                </ItemContent>
              </Item>
            </ItemGroup>
          </Specimen>
        ))}
      </div>
    </SubSection>
  )
}

export function MenuGallery() {
  const [showLinkedIn, setShowLinkedIn] = React.useState(true)

  return (
    <SubSection
      title="Menus"
      description="Dropdown menu for actions; navigation menu for site navigation with rich panels."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Specimen label="DropdownMenu" className="flex min-h-48 items-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <HugeiconsIcon icon={Settings01Icon} data-icon="inline-start" />
                Open menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Get in touch</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={Mail01Icon} />
                  Email
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={Calendar03Icon} />
                  Book a chat
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={FavouriteIcon} />
                  Save for later
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showLinkedIn}
                onCheckedChange={setShowLinkedIn}
              >
                <HugeiconsIcon icon={Linkedin01Icon} />
                Show LinkedIn
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <HugeiconsIcon icon={Delete02Icon} />
                Delete
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <HugeiconsIcon icon={Logout01Icon} />
                Disabled
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Specimen>

        <Specimen label="NavigationMenu" className="flex min-h-48 items-start">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Work</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-72 gap-1 p-1">
                    {[
                      ["Vemi", "Ethical banking app"],
                      ["Foundgood", "Philanthropic impact measurement"],
                      ["TechSoup", "Nonprofit tech marketplace"],
                    ].map(([title, desc]) => (
                      <li key={title}>
                        <NavigationMenuLink href="#components">
                          <span className="type-small font-medium">{title}</span>
                          <span className="type-caption text-muted-foreground">
                            {desc}
                          </span>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="#components">About</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </Specimen>
      </div>
    </SubSection>
  )
}

export function SeparatorGallery() {
  return (
    <SubSection title="Separator" description="Hairline divider using the border token.">
      <Specimen className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="type-small">Horizontal</span>
          <Separator />
          <span className="type-small text-muted-foreground">Content below</span>
        </div>
        <div className="flex h-6 items-center gap-4">
          <span className="type-small">Work</span>
          <Separator orientation="vertical" />
          <span className="type-small">About</span>
          <Separator orientation="vertical" />
          <span className="type-small">Contact</span>
        </div>
      </Specimen>
    </SubSection>
  )
}

export function ThemeToggleGallery() {
  return (
    <SubSection
      title="Theme toggle"
      description="Header light/dark switch, built as the preset's segmented control. Below 640px it collapses to a single segment showing the current mode."
    >
      <Specimen className="flex items-center gap-6">
        <ThemeToggle />
        <span className="type-small text-muted-foreground">
          Click to switch the whole site.
        </span>
      </Specimen>
    </SubSection>
  )
}
