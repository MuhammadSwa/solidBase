# Tailwind v4 CSS Variables Guide (OKLCH Format)

## Overview

This application uses **CSS custom properties (variables)** with **OKLCH color format** for all colors. OKLCH provides better color manipulation, perceptual uniformity, and wider color gamut support compared to traditional RGB/hex colors.

### Why OKLCH?

- **Perceptually uniform** - Colors that look equally different actually are equally different
- **Predictable lightness** - Lightness values work consistently across all hues
- **Wider gamut** - Access to more vibrant colors beyond sRGB
- **Better gradients** - Smoother color transitions without muddy midpoints
- **Easier manipulation** - Adjust lightness/chroma/hue independently

### OKLCH Format

```css
oklch(lightness chroma hue)
```

- **Lightness**: 0-100% (0 = black, 100 = white)
- **Chroma**: 0-0.4 (saturation, 0 = gray, higher = more saturated)
- **Hue**: 0-360 degrees (red=0, yellow=90, green=120, blue=240)

Example: `oklch(62.3% 0.214 259.815)` = blue-500

## Available CSS Variables

### Background Colors
```css
--color-bg-primary        /* Main backgrounds (white/gray-800) */
--color-bg-secondary      /* Page backgrounds (gray-50/gray-900) */
--color-bg-tertiary       /* Elevated surfaces (gray-100/gray-700) */
--color-bg-elevated       /* Modals, popovers (white/gray-700) */
```

### Text Colors
```css
--color-text-primary      /* Primary text (gray-900/gray-100) */
--color-text-secondary    /* Secondary text (gray-600/gray-300) */
--color-text-tertiary     /* Tertiary/muted text (gray-500/gray-400) */
--color-text-inverse      /* Inverse text (white/gray-900) */
```

### Border Colors
```css
--color-border-primary    /* Default borders (gray-200/gray-700) */
--color-border-secondary  /* Secondary borders (gray-300/gray-600) */
--color-border-focus      /* Focus states (blue-500/blue-400) */
```

### Brand Colors
```css
--color-brand-primary          /* Primary brand color (blue-600/blue-400) */
--color-brand-primary-hover    /* Primary hover state (blue-700/blue-500) */
--color-brand-secondary        /* Secondary brand (purple-600/purple-400) */
--color-brand-secondary-hover  /* Secondary hover (purple-700/purple-500) */
```

### Semantic Colors - Success
```css
--color-success        /* Success color (green-600/green-400) */
--color-success-hover  /* Success hover (green-700/green-500) */
--color-success-bg     /* Success background (green-50/green-900/20) */
--color-success-border /* Success border (green-200/green-800) */
--color-success-text   /* Success text (green-800/green-300) */
```

### Semantic Colors - Error
```css
--color-error        /* Error color (red-600/red-400) */
--color-error-hover  /* Error hover (red-700/red-500) */
--color-error-bg     /* Error background (red-50/red-900/20) */
--color-error-border /* Error border (red-200/red-800) */
--color-error-text   /* Error text (red-800/red-300) */
```

### Semantic Colors - Warning
```css
--color-warning        /* Warning color (yellow-600/yellow-400) */
--color-warning-hover  /* Warning hover (yellow-700/yellow-500) */
--color-warning-bg     /* Warning background (yellow-50/yellow-900/20) */
--color-warning-border /* Warning border (yellow-200/yellow-800) */
--color-warning-text   /* Warning text (yellow-800/yellow-300) */
```

### Semantic Colors - Info
```css
--color-info        /* Info color (blue-600/blue-400) */
--color-info-hover  /* Info hover (blue-700/blue-500) */
--color-info-bg     /* Info background (blue-50/blue-900/20) */
--color-info-border /* Info border (blue-200/blue-800) */
--color-info-text   /* Info text (blue-800/blue-300) */
```

### Accent Colors
```css
--color-accent-purple        /* Purple accent (purple-600/purple-400) */
--color-accent-purple-hover  /* Purple hover (purple-700/purple-500) */
--color-accent-orange        /* Orange accent (orange-600/orange-400) */
--color-accent-orange-hover  /* Orange hover (orange-700/orange-500) */
--color-accent-pink          /* Pink accent (pink-600/pink-400) */
--color-accent-pink-hover    /* Pink hover (pink-700/pink-500) */
```

### Gradient Colors
```css
--gradient-primary-from      /* Primary gradient start */
--gradient-primary-to        /* Primary gradient end */
--gradient-secondary-from    /* Secondary gradient start */
--gradient-secondary-to      /* Secondary gradient end */
--gradient-accent-from       /* Accent gradient start */
--gradient-accent-to         /* Accent gradient end */
```

## Usage in Components

### Using CSS Variables with Tailwind

```tsx
// Background colors
<div class="bg-[var(--color-bg-primary)]">

// Text colors
<p class="text-[var(--color-text-primary)]">

// Border colors
<div class="border border-[var(--color-border-primary)]">

// Brand colors
<button class="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]">

// Gradients
<div class="bg-gradient-to-br from-[var(--gradient-primary-from)] to-[var(--gradient-primary-to)]">
```

## Component Library Usage

All UI components (`/src/lib/ui/`) now use these variables:

```tsx
// Card component
<Card> // Uses var(--color-bg-primary) and var(--color-border-primary)

// Button component
<Button variant="primary"> // Uses var(--color-brand-primary)
<Button variant="danger">  // Uses var(--color-error)
<Button variant="success"> // Uses var(--color-success)

// InfoBox component
<InfoBox variant="info">    // Uses var(--color-info-*)
<InfoBox variant="success"> // Uses var(--color-success-*)
<InfoBox variant="warning"> // Uses var(--color-warning-*)
<InfoBox variant="error">   // Uses var(--color-error-*)

// FormField component
// Automatically uses text, border, and focus variables

// PageLayout component
<PageLayout variant="gradient"> // Uses gradient variables
```

## Customizing the Theme

### Step 1: Edit `/src/index.css`

Find the `@theme` block and modify the OKLCH color values:

```css
@theme {
  /* Change the primary brand color from blue to purple */
  --color-brand-primary: oklch(55.8% 0.288 302.321);       /* purple-600 */
  --color-brand-primary-hover: oklch(49.6% 0.265 301.924); /* purple-700 */
  
  /* Change success color from green to teal */
  --color-success: oklch(60% 0.118 184.704);        /* teal-600 */
  --color-success-hover: oklch(51.1% 0.096 186.391); /* teal-700 */
}
```

### Step 2: Update Dark Mode (Optional)

Also update the `.dark` class section:

```css
.dark {
  --color-brand-primary: oklch(71.4% 0.203 305.504);  /* purple-400 for dark mode */
  --color-success: oklch(77.7% 0.152 181.912);        /* teal-400 for dark mode */
}
```

### Step 3: Save and See Changes

Changes apply instantly with HMR! All components update automatically.

## Examples

### Example 1: Change Brand Color to Green

```css
@theme {
  --color-brand-primary: oklch(62.7% 0.194 149.214);       /* green-600 */
  --color-brand-primary-hover: oklch(52.7% 0.154 150.069); /* green-700 */
}

.dark {
  --color-brand-primary: oklch(79.2% 0.209 151.711);       /* green-400 */
  --color-brand-primary-hover: oklch(72.3% 0.219 149.579); /* green-500 */
}
```

All buttons, links, and focus states will now be green!

### Example 2: Use a Custom Color Palette

```css
@theme {
  /* Custom teal-based brand */
  --color-brand-primary: oklch(70.4% 0.14 182.503);        /* teal-500 */
  --color-brand-primary-hover: oklch(60% 0.118 184.704);   /* teal-600 */
  
  /* Custom orange accent */
  --color-accent-purple: oklch(70.5% 0.213 47.604);        /* orange-500 */
  --color-accent-purple-hover: oklch(64.6% 0.222 41.116);  /* orange-600 */
}
```

### Example 3: Create Custom Colors

```css
@theme {
  /* Vibrant coral */
  --color-brand-primary: oklch(74% 0.17 40.24);
  
  /* Deep ocean blue */
  --color-accent-purple: oklch(49% 0.08 205.88);
  
  /* Warm sunset */
  --gradient-primary-from: oklch(82% 0.15 72.09);
  --gradient-primary-to: oklch(74% 0.17 40.24);
}
```

### Example 4: Adjust Color Lightness

OKLCH makes it easy to create lighter/darker variants:

```css
@theme {
  /* Base color */
  --color-brand-primary: oklch(62.3% 0.214 259.815); /* blue-500 */
  
  /* Lighter variant - increase lightness */
  --color-brand-light: oklch(70.7% 0.214 259.815);   /* same hue/chroma, lighter */
  
  /* Darker variant - decrease lightness */
  --color-brand-dark: oklch(54.6% 0.214 259.815);    /* same hue/chroma, darker */
  
  /* More saturated - increase chroma */
  --color-brand-vibrant: oklch(62.3% 0.30 259.815);  /* more saturated */
  
  /* Less saturated - decrease chroma */
  --color-brand-muted: oklch(62.3% 0.10 259.815);    /* more muted */
}
```

## Migration from Hardcoded Colors

### Before (Old Way)
```tsx
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  <button class="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600">
```

### After (New Way)
```tsx
<div class="bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
  <button class="bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]">
```

### Benefits
- ✅ **Single source of truth** - Change once, applies everywhere
- ✅ **No dark mode duplication** - Variables handle light/dark automatically
- ✅ **Easy theme switching** - Update `index.css`, done!
- ✅ **Type-safe with Tailwind** - Still get all Tailwind's features
- ✅ **Better maintainability** - Clear, semantic variable names

## Best Practices

1. **Always use variables for colors** - Never hardcode color values
2. **Use semantic names** - `--color-text-primary` not `--gray-900`
3. **Test both themes** - Always check light AND dark mode
4. **Use component library** - Components already use variables correctly
5. **Document custom variables** - If you add new ones, document them

## Component Variable Reference

### Card
- Background: `--color-bg-primary`
- Border: `--color-border-primary`

### Button
- Primary: `--color-brand-primary` + `--color-brand-primary-hover`
- Danger: `--color-error` + `--color-error-hover`
- Success: `--color-success` + `--color-success-hover`
- Secondary: `--color-bg-tertiary` + `--color-bg-elevated`

### InfoBox
- Info: `--color-info-*` variables
- Success: `--color-success-*` variables
- Warning: `--color-warning-*` variables
- Error: `--color-error-*` variables

### StatsCard
- Blue: `--color-brand-primary`
- Green: `--color-success`
- Orange: `--color-accent-orange`
- Purple: `--color-accent-purple`
- Red: `--color-error`

### FormField
- Background: `--color-bg-primary`
- Text: `--color-text-primary`
- Border: `--color-border-primary`
- Focus: `--color-brand-primary`
- Error: `--color-error`

## Troubleshooting

### Variables not applying?
- Make sure you're using `[var(--variable-name)]` syntax
- Check that the variable is defined in `@theme` block
- Verify dark mode variables are in `.dark` class

### Colors look wrong in dark mode?
- Check `.dark` class section has the variable defined
- Make sure HTML has the `.dark` class when in dark mode
- Test with the dark mode toggle in the nav bar

### Want to add a new variable?
1. Add it to `@theme` block in `index.css`
2. Add corresponding dark mode value in `.dark` class
3. Document it in this file
4. Use it with `[var(--your-variable)]` syntax

### Converting colors to OKLCH

**Option 1: Use Browser DevTools**
```css
/* In browser console */
const color = new Color("sRGB", [0.231, 0.510, 0.965]); // blue-500
color.to("oklch"); // { l: 0.623, c: 0.214, h: 259.815 }
```

**Option 2: Online Tools**
- [OKLCH Color Picker](https://oklch.com/)
- [Coloraide](https://facelessuser.github.io/coloraide/)
- [Evil Martians OKLCH](https://oklch.evilmartians.io/)

**Option 3: Reference Tailwind's default theme**
All Tailwind colors are defined in OKLCH in the [default theme reference](https://tailwindcss.com/docs/theme#default-theme-variable-reference).

### OKLCH Browser Support

- ✅ Chrome/Edge 111+
- ✅ Safari 15.4+
- ✅ Firefox 113+
- ⚠️ Older browsers will fall back to sRGB gamut (still works, less vibrant)

## Future Enhancements

Possible additions:
- Shadow variables (`--shadow-sm`, `--shadow-lg`)
- Spacing variables (`--space-sm`, `--space-lg`)
- Font variables (`--font-primary`, `--font-mono`)
- Radius variables (`--radius-sm`, `--radius-lg`)
- Animation variables (`--duration-fast`, `--duration-slow`)
