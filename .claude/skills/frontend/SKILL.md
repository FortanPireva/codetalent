---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Tech Stack Requirements

This project uses specific technologies that MUST be followed:
- **Component Library**: Use **shadcn/ui** components as the foundation. Leverage its accessible, composable primitives and extend them with custom styling.
- **Styling**: Tailwind CSS with CSS variables for theming.
- **Typography**: Use **Satoshi** font family as the primary typeface. Import from Google Fonts or local assets.
- **Theme**: Support both **dark and light themes**. Use CSS variables for seamless theme switching.
- **Brand Color**: Primary/brand color is **#141414** (near-black). Build the color palette around this anchor.

## Color System

```css
/* Light theme */
--background: #ffffff;
--foreground: #141414;
--primary: #141414;
--primary-foreground: #ffffff;

/* Dark theme */
--background: #141414;
--foreground: #ffffff;
--primary: #ffffff;
--primary-foreground: #141414;
```

Extend this palette with complementary accent colors that work in both themes while keeping #141414 as the visual anchor.

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Use **Satoshi** as the primary font family. It provides a modern, geometric sans-serif aesthetic with excellent readability. Apply proper font weights (Regular 400, Medium 500, Bold 700) for hierarchy.
- **Color & Theme**: Commit to a cohesive aesthetic anchored by **#141414**. Use CSS variables for consistency and theme switching. Build contrast through the interplay of the near-black primary with clean whites and subtle grays.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts - use **Satoshi** instead), cliched color schemes (particularly purple gradients on white backgrounds - use **#141414** based palettes instead), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character. Always build on **shadcn/ui** components.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.