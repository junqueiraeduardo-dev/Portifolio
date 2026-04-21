# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static landing page for **Nexus Studio** (fictional creative digital agency). Portfolio project — no build tools, no framework, no dependencies.

**Stack:** Vanilla HTML + CSS + JavaScript (ES6+, IIFE pattern), single-page layout.

## Running the Project

Open `index.html` directly in a browser, or use any static file server:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

No build step, no package manager, no compilation.

## File Structure

| File | Role |
|------|------|
| `index.html` | Full page markup — all sections in one file |
| `styles.css` | All styles — uses CSS custom properties (`--clr-*`, `--grad-*`, etc.) |
| `script.js` | All JS — each feature is a self-contained IIFE in numbered order |

## Architecture

### CSS Design Tokens (`:root` in `styles.css`)
All colors, gradients, shadows, radii and transitions are CSS variables. Change palette by editing `:root` only.

### JavaScript Modules (IIFEs in `script.js`)
Each feature is isolated as a numbered IIFE. Execution order matters only for #5 (Reveal — must run after DOM is ready). The modules are:

1. **Nav** — scroll-based class toggle + mobile burger menu
2. **Hero Canvas** — particle animation via `requestAnimationFrame`
3. **Typewriter** — cycles through words array with delete/type loop
4. **Counters** — `IntersectionObserver` triggers number count-up animation
5. **Scroll Reveal** — `IntersectionObserver` adds `.visible` class to `.reveal` elements
6. **Project Filters** — `data-category` attribute filtering with opacity/scale
7. **Testimonial Slider** — pixel-based `translateX` slider; navigates card-by-card, max index = `total - getVisible()` so last card is always fully visible
8. **Contact Form** — client-side validation + simulated async submit
9. **Active Nav Link** — `IntersectionObserver` highlights nav link matching current section
10. **Cursor Glow** — lerp-smoothed radial gradient follows mouse (desktop only)

### Testimonial Slider — key invariant
`goTo(idx)` clamps `current` to `[0, total - getVisible()]`. Card width is measured live with `cards[0].offsetWidth` (pixels), not percentages. Do not revert to `%`-based `translateX` — it was the cause of the last card being unreadable.

### Responsive Breakpoints
Defined both in CSS media queries and in JS `getVisible()`:
- `≤ 768px` — mobile (1 card visible)
- `≤ 1024px` — tablet (2 cards visible)
- `> 1024px` — desktop (3 cards visible)

## UI/UX Skill

This project uses the **`ui-ux-pro-max`** skill (`.claude/skills/ui-ux-pro-max/`). Invoke it when making any visual or interaction changes. Priority order from the skill: Accessibility → Touch/Interaction → Performance → Style → Layout → Typography → Animation → Forms → Navigation → Charts.
