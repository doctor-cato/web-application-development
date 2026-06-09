# Spatial UI Guidelines

## Overview

3HD2Kcinema now utilizes an "Out-of-the-box" **Spatial & Ambient UI**.
This breaks away from traditional dark mode apps. We focus on:

* **Immersion**: The app should feel like a living, breathing movie theater.
* **Spatial Depth**: Elements should feel physically layered on top of one another.
* **Fluidity**: Transitions should mimic liquid or glass, not stiff digital boxes.
* **Glanceability**: Important information must be digestible instantly via the Bento layout.

---

## 1. Visual Identity & Theme

### The Ambient Base
Instead of hard black or gray backgrounds, the background is always dynamic. It utilizes blurred "Aurora" gradients that pull colors from the movie currently being viewed.
- **Rule**: Never use a solid flat `#000000` or `#FFFFFF` background. Always use a deep spatial color (`#05050A`) accompanied by softly glowing ambient blobs.

### The Material (Glass)
- **Rule**: All major containers (cards, modals, navbars) must use a frosted glass effect (`backdrop-blur`).
- **Rule**: Avoid opaque borders. Use semi-transparent white/gray borders (e.g., `border-white/10`) to create "edges" to the glass.

---

## 2. Layout Rules: The Bento Grid

### Philosophy
Discard lists. Discard endless scrolling. Structure the UI into a rigid but playful **Bento Grid**.

- **Modularity**: Every feature is a widget. (e.g., The trailer is a 2x2 widget, the synopsis is a 1x1 widget, the cast list is a 2x1 widget).
- **Gaps**: Use consistent, thick gaps between Bento items (`gap-4` or `gap-6`) to let the ambient background bleed through.
- **Rounded Corners**: All Bento tiles must have exaggerated border radii (`rounded-3xl` or higher). No sharp 90-degree corners.

---

## 3. Typography Guidelines

We use **Kinetic & Fluid Typography**.

- **Scale**: Use massive, tight-tracking headers for movie titles (e.g., `text-6xl tracking-tighter`). 
- **Hierarchy**: Use extreme contrast between headings and body text. If the header is massive and bold, the metadata should be tiny and muted.
- **Motion**: Text should subtly slide in or scale upon render.

---

## 4. Component Rules

### Buttons & Inputs
- Must feel tactile. 
- Use inner shadows or soft outer glows.
- **Hover States**: Should increase the brightness of the glass or scale up slightly (`scale-105`), providing immediate feedback.

### Modals
- **Rule**: Do not use full-screen opaque overlays.
- Modals slide up from the bottom (like a bottom sheet) or float in the center, heavily blurring the Bento grid behind them.

### Seat Selection (Spatial)
- The seat map is not a flat Excel-like grid.
- Seats should look like interactive glass pebbles or illuminated slots.
- Hovering over a seat should show a tooltip with a preview of the view from that angle, or at least cast a dynamic glow on surrounding elements.

---

## 5. Animation & Motion

- **Easing**: Always use soft, spring-like easing. No linear transitions.
- **Micro-interactions**: Every click, hover, and drag should have a response. 
- **Rule of Thumb**: If it looks like glass, it should move smoothly and reflect light dynamically.

---

## 6. Accessibility in Spatial UI

Because we rely heavily on blur and transparency, accessibility is critical:
- **Contrast**: Ensure text on glass has a high enough contrast ratio against the ambient background. If the background gets too bright, the glass must automatically darken its base color (`bg-black/40`).
- **Reduced Motion**: Respect `prefers-reduced-motion` queries by falling back to simple fade transitions instead of large scaling or sliding animations.
