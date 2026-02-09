---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of clean, production-grade frontend interfaces built on a strict black-and-white design system with the Satoshi typeface. Every interface should feel intentional, refined, and typographically driven.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Philosophy

This project follows a **monochromatic black-and-white** design system anchored by the brand color **#141414** (near-black). Every design decision flows from this constraint:

- **Brand anchor: #141414.** This near-black is the primary brand color — used for primary actions, headings, and key UI elements in light mode. In dark mode it becomes the background. All other colors are grayscale relatives of this anchor.
- **No color accents.** The palette is #141414, white, and grays. Period. Hierarchy comes from typography weight, size, spacing, and opacity — never from color.
- **Typography is the design.** With color removed, Satoshi does the heavy lifting. Every heading, label, and body block must have deliberate weight, size, tracking, and leading.
- **Contrast is king.** Sharp #141414-on-white and white-on-#141414 pairings create visual punch. Use subtle grays (`muted`, `muted-foreground`) sparingly for secondary content.
- **Whitespace is structure.** Generous padding and margins define sections. Let content breathe. Dense UIs feel cluttered in B&W — space is your separator.

Before coding, consider:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Hierarchy**: What should the user see first, second, third? Plan the typographic scale.
- **Density**: Is this a data-heavy admin view or a spacious landing page? Adjust spacing accordingly.

## Tech Stack (Non-Negotiable)

- **Framework**: React 19 + Next.js 15 (App Router)
- **Component Library**: **shadcn/ui** — always use and extend these primitives, never build from scratch
- **Styling**: Tailwind CSS v4 with CSS variables (oklch color space)
- **Typography**: **Satoshi** font family — the ONLY font used in this project. Never use Inter, Geist, Roboto, system fonts, or any other typeface
- **Theme**: Support both dark and light modes via CSS variables and the `.dark` class

## Typography System — Satoshi

Satoshi is a modern geometric sans-serif. Use it with intention:

```
Font family: "Satoshi", sans-serif

Weights:
- 400 Regular  → Body text, descriptions, table cells
- 500 Medium   → Labels, nav items, subtle emphasis
- 700 Bold     → Headings, key metrics, primary actions
- 900 Black    → Hero text, large display numbers (use sparingly)

Recommended scale:
- text-xs   (12px) → Captions, timestamps, badges
- text-sm   (14px) → Secondary text, table data, form hints
- text-base (16px) → Body copy, form inputs
- text-lg   (18px) → Section subheadings, card titles
- text-xl   (20px) → Page subheadings
- text-2xl  (24px) → Page titles
- text-3xl+ (30px+) → Hero/display text

Letter spacing:
- tracking-tight (-0.025em) → Headings and large text
- tracking-normal → Body text
- tracking-wide (0.025em) → Uppercase labels, badges, small caps
```

**CRITICAL**: The `--font-sans` CSS variable in the theme config MUST resolve to Satoshi. When creating layouts, always ensure `font-sans` maps to Satoshi. Never import or reference Geist, Inter, or any other font.

## Color System — #141414 Anchored Black & White

The brand color is **#141414** (`oklch(0.145 0 0)`). The entire palette is built around this near-black anchor with zero chroma (pure grayscale). These are already defined in `globals.css`:

### Light Mode (`:root`)
```css
--background: oklch(1 0 0);           /* #ffffff — pure white */
--foreground: oklch(0.145 0 0);       /* #141414 — brand color, main text */
--primary: oklch(0.205 0 0);          /* #141414-derived deep black for actions */
--primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.97 0 0);         /* off-white surface */
--muted: oklch(0.97 0 0);             /* subtle background */
--muted-foreground: oklch(0.556 0 0); /* gray text */
--border: oklch(0.922 0 0);           /* light gray border */
--input: oklch(0.922 0 0);
--ring: oklch(0.708 0 0);
```

### Dark Mode (`.dark`)
```css
--background: oklch(0.145 0 0);       /* #141414 — brand color as background */
--foreground: oklch(0.985 0 0);       /* off-white text */
--primary: oklch(0.922 0 0);          /* light gray for actions */
--primary-foreground: oklch(0.205 0 0);
--secondary: oklch(0.269 0 0);        /* dark surface */
--muted: oklch(0.269 0 0);
--muted-foreground: oklch(0.708 0 0); /* medium gray text */
--border: oklch(1 0 0 / 10%);         /* translucent white border */
--input: oklch(1 0 0 / 15%);
```

**Rules:**
- **#141414 is the brand.** It appears as `--foreground` in light mode and `--background` in dark mode. It is the visual constant across both themes.
- NEVER add colored accents (blue, green, purple, etc.) except for `--destructive` (red) which is reserved for errors and dangerous actions only.
- Create visual interest through **contrast ratios**, **opacity variations**, and **border weights** — not color.
- When you need visual differentiation (e.g., status badges, chart categories), use **grayscale steps**: `oklch(0.3 0 0)`, `oklch(0.5 0 0)`, `oklch(0.7 0 0)`, `oklch(0.9 0 0)`.

## shadcn/ui Component Tailoring

Use shadcn/ui components as the foundation but tailor them to match the B&W design system. Below are the specific customization patterns for the components available in this project.

### Buttons
Refine the default shadcn button for a sharper B&W feel:
- **Default**: Solid black background, white text. On hover, ease to `bg-primary/85`. Use `font-medium tracking-wide` for uppercase labels or `font-medium` for sentence case.
- **Outline**: 1px border (`border-foreground/20`), transparent background. On hover, fill to `bg-foreground/5`.
- **Ghost**: No border, no background. On hover, `bg-foreground/5`. Use for toolbar actions and secondary navigation.
- **Sizing**: Prefer `h-10 px-5` for primary actions (slightly larger than default) and `h-8 px-3 text-xs` for compact/table actions.
- Add `transition-all duration-200` for smooth hover states.

### Cards
Clean, structured containers:
- Use `border border-border/60` for subtler borders instead of the default.
- Apply `shadow-none` or `shadow-xs` — avoid heavy shadows in B&W (they look muddy).
- Card titles: `text-lg font-bold tracking-tight` (Satoshi Bold).
- Card descriptions: `text-sm text-muted-foreground font-normal`.
- Consider `divide-y divide-border/60` inside cards for sectioned content.

### Inputs & Form Elements
Crisp, minimal form controls:
- Inputs: `border-border bg-transparent font-normal` with `focus-visible:ring-foreground/20 focus-visible:border-foreground/40`.
- Labels: `text-sm font-medium tracking-normal`.
- Select triggers: Match input styling. Use `font-normal` for the selected value.
- Checkboxes/Switches: Ensure checked state uses `bg-foreground` (black in light mode, white in dark mode).

### Tables
Data-dense but readable:
- Header: `text-xs font-bold uppercase tracking-widest text-muted-foreground` — this creates clear hierarchy.
- Cells: `text-sm font-normal`.
- Row hover: `hover:bg-muted/50` for subtle feedback.
- Borders: Use `divide-y` on tbody, `border-b` on thead. Keep it light.

### Badges
Typographic status indicators:
- Default: `bg-foreground text-background font-medium text-xs tracking-wide` (inverted solid).
- Outline: `border border-foreground/30 text-foreground font-medium text-xs`.
- Muted: `bg-muted text-muted-foreground font-medium text-xs`.
- Avoid rounded-full for badges — use `rounded-md` to keep the geometric/sharp feel.

### Dialogs & Sheets
Modal surfaces:
- Use `bg-background border border-border` with no shadow or `shadow-lg shadow-black/5`.
- Title: `text-xl font-bold tracking-tight`.
- Description: `text-sm text-muted-foreground`.
- Overlay: `bg-black/60` (light mode) / `bg-black/80` (dark mode) for strong backdrop contrast.

### Tabs
Navigation with clear active states:
- Inactive: `text-muted-foreground font-medium`.
- Active: `text-foreground font-bold border-b-2 border-foreground`.
- Use underline-style tabs (`border-b`) rather than filled/pill tabs for the editorial feel.

## Layout & Spacing Patterns

- **Page containers**: `max-w-6xl mx-auto px-6 py-8` for standard pages. Use `max-w-4xl` for focused/form pages.
- **Section spacing**: `space-y-8` or `space-y-12` between major sections. Never less than `space-y-6`.
- **Grid layouts**: Use `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` for card grids. Consistent `gap-6` everywhere.
- **Dividers**: Prefer `border-t border-border/60` or generous whitespace over `<Separator />` when possible.

## Motion & Interaction

Keep animations subtle and fast in a B&W system — there's no color to soften jarring transitions:

- **Hover states**: `transition-all duration-200 ease-out`. Change opacity, background, or border — not position.
- **Page transitions**: Fade in with `animate-in fade-in-0 duration-300`.
- **Staggered reveals**: Use `animation-delay` on lists/grids for a polished load sequence. Keep delays short (50-100ms increments).
- **Avoid**: Bouncing, scaling, rotating, or playful animations. The B&W system demands restraint.

## Anti-Patterns (NEVER Do These)

- **Never use colored accents** (blue links, green success, orange warnings) — use grayscale + icons instead
- **Never use fonts other than Satoshi** — no Inter, Geist, Roboto, Arial, system-ui, or any other typeface
- **Never use heavy box shadows** — `shadow-xs` or `shadow-none` only
- **Never use rounded-full on containers** — keep geometric with `rounded-lg` or `rounded-xl` max
- **Never use gradient backgrounds** — solid fills and subtle opacity variations only
- **Never add decorative illustrations or colorful icons** — use Lucide icons in `text-foreground` or `text-muted-foreground`
- **Never default to shadcn's out-of-box styling** — always apply the tailoring patterns above
- **Never use placeholder colors** from shadcn's default theme (blues, greens, etc.)

## Quality Checklist

Before completing any UI work, verify:
- [ ] All text renders in Satoshi (check `font-sans` mapping)
- [ ] No color appears outside the grayscale palette (except `--destructive` for errors)
- [ ] Typography hierarchy is clear: headings are bold/tracking-tight, body is regular
- [ ] Spacing is generous and consistent
- [ ] Both light and dark modes look intentional (not just inverted)
- [ ] shadcn/ui components are tailored per the patterns above, not used with defaults
- [ ] Hover/focus states are present and use subtle transitions
- [ ] The interface feels sharp, clean, and typographically driven
