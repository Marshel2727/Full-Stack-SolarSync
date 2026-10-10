---
name: SolarSync Lumina
colors:
  surface: '#f8faf6'
  surface-dim: '#d8dbd7'
  surface-bright: '#f8faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f1'
  surface-container: '#eceeeb'
  surface-container-high: '#e7e9e5'
  surface-container-highest: '#e1e3e0'
  on-surface: '#191c1b'
  on-surface-variant: '#404944'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#eff1ee'
  outline: '#707974'
  outline-variant: '#bfc9c3'
  surface-tint: '#2b6954'
  primary: '#003527'
  on-primary: '#ffffff'
  primary-container: '#064e3b'
  on-primary-container: '#80bea6'
  inverse-primary: '#95d3ba'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#ffc329'
  on-secondary-container: '#6f5100'
  tertiary: '#4f1f19'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b342d'
  on-tertiary-container: '#ea9e93'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f0d6'
  primary-fixed-dim: '#95d3ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#0b513d'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f9bd22'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4a9'
  on-tertiary-fixed: '#380d08'
  on-tertiary-fixed-variant: '#6e372f'
  background: '#f8faf6'
  on-background: '#191c1b'
  surface-variant: '#e1e3e0'
  forest-deep: '#022C22'
  solar-glow: '#FDE68A'
  eco-success: '#10B981'
  energy-neutral: '#F8FAFC'
  slate-text: '#1E293B'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.1em
  numeric-data:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-gap: 80px
---

## Brand & Style

The design system is built to evoke **technological optimism** and **institutional trust**. It serves a dual purpose: educating the public on sustainable energy and providing high-precision monitoring for existing users. The brand personality is "The Expert Partner"—authoritative yet accessible, innovative yet reliable.

The visual direction follows a **Corporate Modern** style infused with **Glassmorphism**. This combination allows for a clean, professional aesthetic (essential for high-value solar investments) while using translucent layers to represent the "transparency" of energy data and the "light" of solar power. The interface should feel premium, utilizing high-contrast typography and deep, saturated tones to differentiate from the typical "flat" green energy websites.

**Emotional Response:**
- **Empowered:** Through clear data and calculators.
- **Secure:** Through professional, structured layouts.
- **Progressive:** Through subtle motion and modern depth effects.

## Colors

The palette is anchored by **Deep Emerald (#064E3B)**, symbolizing deep-rooted sustainability and growth. This is contrasted with **Solar Gold (#FBBF24)**, used sparingly for critical actions (CTAs) and success metrics to represent energy production.

- **Primary:** Used for brand headers, primary buttons, and structural navigation elements.
- **Secondary:** Reserved for highlighting "Energy Generated," "Savings (IDR)," and active states in the user journey.
- **Neutrals:** A range of Cool Grays and Whites ensure the "tech-forward" feel. Pure black is avoided in favor of Deep Forest for text to maintain a natural, premium softness.
- **Data Visualization:** Use a gradient scale from Emerald to Gold to represent energy efficiency levels.

## Typography

This design system uses **Plus Jakarta Sans** for its friendly yet geometric profile, which bridges the gap between organic sustainability and modern engineering. **Inter** is used for smaller labels and utility text to ensure maximum legibility in data-dense dashboard views.

**Usage Rules:**
- **Tracking:** Headings use negative tracking (-0.02em) for a tighter, high-end editorial look.
- **Currency (IDR):** Financial figures should use the `numeric-data` style with a slightly heavier weight to emphasize ROI and savings.
- **Language:** Ensure the typography remains balanced for Indonesian text lengths, which can be longer than English counterparts (e.g., "Mulai Sekarang" vs "Start").

## Layout & Spacing

The system employs a **12-column Fixed Grid** for desktop to maintain a controlled, premium feel, switching to a **fluid 4-column grid** for mobile. 

**Layout Model:**
- **Safe Zones:** Generous internal padding (32px+) within cards to allow the content to "breathe."
- **Data Density:** Dashboard views utilize a "Comfortable" density setting, preventing information overload by grouping related energy metrics into distinct containers.
- **Responsive Reflow:** On mobile, side-by-side dashboard widgets stack vertically, while the "Solar Calculator" inputs use a step-by-step wizard format to maintain focus.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Glassmorphism**. 

- **Level 0 (Background):** Solid white or very light gray (`#F8FAFC`).
- **Level 1 (Cards):** White background with a subtle 1px border (`#E2E8F0`).
- **Level 2 (Active Dashboard Widgets):** A frosted glass effect using a 12px backdrop blur and 80% opacity white fill. This is used to draw attention to "Live Monitoring" data.
- **Shadows:** Use "Ambient Shadows"—low opacity (8%), large blur radius (24px), with a tiny hint of the primary emerald color to ground the elements.

## Shapes

The shape language is defined by **Medium Roundedness**. This softens the "industrial" nature of solar panels and makes the platform feel more approachable for households.

- **Standard Elements:** Buttons, input fields, and small widgets use a 0.5rem radius.
- **Featured Containers:** Large dashboard cards and "Knowledge Center" article previews use a 1rem radius (`rounded-lg`) to emphasize their distinct sections.
- **Icons:** Should follow a "soft-linear" style with 1.5pt strokes and rounded terminals to match the UI.

## Components

### Buttons
- **Primary:** Solid Emerald background, White text. High-contrast and bold.
- **Secondary:** Solar Gold background, Deep Forest text. Used for "Calculate ROI" or "Request Install."
- **Ghost:** Transparent with Emerald border for secondary educational links.

### Dashboard Cards
- Feature a "Glassmorphism" header area where the metric title lives.
- Bottom section contains the numeric data in IDR or kWh using the `numeric-data` type style.
- Include a small sparkline chart (Chart.js) to show 24h trends.

### Solar Calculator Inputs
- Use large, custom-styled range sliders and numeric inputs.
- Input fields should have a distinct focus state featuring a Solar Gold glow.

### Progress Journey (The 6 Stages)
- A horizontal stepper for desktop, vertical for mobile.
- **Completed Steps:** Emerald with a checkmark.
- **Active Step:** Solar Gold pulsing effect.
- **Pending:** Light gray with thin outlines.

### Data Visualization
- **Line Charts:** Use smooth (bezier) curves rather than jagged lines.
- **Area Charts:** Fill with a gradient from Emerald (Top) to Transparent (Bottom).