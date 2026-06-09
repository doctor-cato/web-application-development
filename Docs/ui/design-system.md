# Spatial Cinema Design System

## Overview

The 3HD2Kcinema Design System is built on three core pillars:
1. **Ambient Aurora Backgrounds**: Dynamic, liquid-like color blobs that adapt to content.
2. **Glassmorphism (Frosted Glass)**: Translucent UI surfaces that float above the ambient backgrounds.
3. **Bento Box Grids**: Highly modular, widget-style layouts prioritizing glanceability.

---

## 1. Ambient Backgrounds (Aurora UI)

Instead of static flat colors, the global background consists of large, heavily blurred gradient meshes (Aurora effect).
The background colors shift based on the context (e.g., matching the dominant colors of a selected movie poster).

### Base Theme
- **Global Dark Base**: `#05050A` (Deep Spatial Black)
- **Primary Aurora**: `--color-aurora-1` (Dynamic, e.g., deep cinematic violet or gold depending on context)
- **Secondary Aurora**: `--color-aurora-2` (Dynamic)

### Implementation
```css
/* Aurora Blob Class */
.aurora-blob {
  position: absolute;
  filter: blur(120px);
  opacity: 0.6;
  mix-blend-mode: screen;
  animation: pulse-slow 15s infinite alternate;
}
```

---

## 2. Glassmorphism System

All panels, cards, and modals use frosted glass effects to create depth without blocking the ambient background.

### UI Surfaces
We use `backdrop-blur` combined with low-opacity backgrounds and subtle borders.

**Primary Glass Card (Base Surface):**
```html
<div class="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
```

**Elevated Glass Card (Hover State):**
```html
<div class="bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
```

### Text Colors on Glass
- **Primary Text**: `text-white` (High contrast)
- **Secondary Text**: `text-white/70` (Subtle)
- **Accent Text**: Dynamic contextual color or Gold `text-amber-400`

---

## 3. Bento Grid System

The UI relies entirely on structured grids of differing block sizes (resembling a Bento Box or iOS widgets). 
Avoid linear, endless scrolling lists.

### Standard Layout
```html
<div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
  <!-- Hero Widget: spans 4 cols, 2 rows -->
  <div class="col-span-1 md:col-span-4 row-span-2 glass-card">...</div>
  
  <!-- Info Widget: spans 2 cols, 1 row -->
  <div class="col-span-1 md:col-span-2 row-span-1 glass-card">...</div>
  
  <!-- Mini Widget: spans 1 col, 1 row -->
  <div class="col-span-1 glass-card">...</div>
</div>
```

**Corner Radius Rule:** All Bento Tiles must use aggressive border-radius: `rounded-[24px]` or `rounded-[32px]`. No sharp edges.

---

## 4. Typography

We utilize **Kinetic Typography**—fonts that are bold, tight, and highly responsive to interactions.

- **Primary Display Font**: `Inter` (Tight tracking, ultra-bold for Heroes).
- **Body Font**: `Inter` (Highly legible).

### Sizing
- **Hero Title**: `text-6xl md:text-8xl tracking-tighter font-black`
- **Tile Title**: `text-2xl font-bold tracking-tight`
- **Metadata**: `text-sm text-white/60 font-medium`

---

## 5. Spatial UI Components

### Floating Action Buttons (FABs) & Tooltips
- Modals do not darken the screen completely. They slide up as an overlapping Glass layer.
- Buttons use internal drop shadows and borders to feel physical.

### Interactive Seat Booking
- Seats are treated as spatial objects. 
- **Available Seat**: `bg-white/10 border-white/20`
- **Selected Seat**: Glowing glass `bg-white/30 border-white shadow-[0_0_20px_rgba(255,255,255,0.6)]`

---

## Conclusion
This system moves 3HD2Kcinema away from generic flat dashboards and into a highly immersive, futuristic app experience. Every component must feel like it physically exists in a 3D space above the ambient background.
