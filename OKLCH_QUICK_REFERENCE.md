# OKLCH Quick Reference for Tailwind v4

## OKLCH Format
```css
oklch(lightness chroma hue)
oklch(L C H)
oklch(62.3% 0.214 259.815)
```

## Parameters

### Lightness (L)
- Range: `0%` to `100%`
- `0%` = pure black
- `50%` = mid-tone
- `100%` = pure white
- **Perceptually uniform** - 50% looks half as bright as 100%

### Chroma (C)
- Range: `0` to `0.4` (can go higher for very saturated colors)
- `0` = completely desaturated (gray)
- `0.1` = subtle color
- `0.2` = moderate saturation
- `0.3+` = highly saturated/vibrant
- **No percentage** - just a decimal number

### Hue (H)
- Range: `0` to `360` degrees
- `0°/360°` = Red
- `30°` = Orange
- `60°` = Yellow
- `120°` = Green
- `180°` = Cyan
- `240°` = Blue
- `300°` = Magenta

## Common Adjustments

### Make Lighter
```css
/* Original */
--color-primary: oklch(62.3% 0.214 259.815);

/* Lighter - increase L by 10-20% */
--color-primary-light: oklch(75% 0.214 259.815);
```

### Make Darker
```css
/* Darker - decrease L by 10-20% */
--color-primary-dark: oklch(50% 0.214 259.815);
```

### More Saturated
```css
/* More vibrant - increase C by 0.05-0.1 */
--color-primary-vibrant: oklch(62.3% 0.30 259.815);
```

### Less Saturated (Muted)
```css
/* More muted - decrease C by 0.05-0.1 */
--color-primary-muted: oklch(62.3% 0.10 259.815);
```

### Shift Hue
```css
/* Warmer - decrease H (towards red/orange) */
--color-primary-warm: oklch(62.3% 0.214 240);

/* Cooler - increase H (towards blue/cyan) */
--color-primary-cool: oklch(62.3% 0.214 280);
```

### Complementary Color
```css
/* Original */
--color-primary: oklch(62.3% 0.214 259.815); /* Blue */

/* Complementary - add/subtract 180° */
--color-complement: oklch(62.3% 0.214 79.815); /* Orange/Yellow */
```

## Tailwind Default Colors (Reference)

### Blue Scale
```css
--color-blue-50:  oklch(97%    0.014 254.604);
--color-blue-100: oklch(93.2%  0.032 255.585);
--color-blue-200: oklch(88.2%  0.059 254.128);
--color-blue-300: oklch(80.9%  0.105 251.813);
--color-blue-400: oklch(70.7%  0.165 254.624);
--color-blue-500: oklch(62.3%  0.214 259.815); /* Base */
--color-blue-600: oklch(54.6%  0.245 262.881);
--color-blue-700: oklch(48.8%  0.243 264.376);
--color-blue-800: oklch(42.4%  0.199 265.638);
--color-blue-900: oklch(37.9%  0.146 265.522);
--color-blue-950: oklch(28.2%  0.091 267.935);
```

### Green Scale
```css
--color-green-50:  oklch(98.2%  0.018 155.826);
--color-green-400: oklch(79.2%  0.209 151.711);
--color-green-500: oklch(72.3%  0.219 149.579); /* Base */
--color-green-600: oklch(62.7%  0.194 149.214);
--color-green-700: oklch(52.7%  0.154 150.069);
```

### Red Scale
```css
--color-red-50:  oklch(97.1%  0.013 17.38);
--color-red-400: oklch(70.4%  0.191 22.216);
--color-red-500: oklch(63.7%  0.237 25.331); /* Base */
--color-red-600: oklch(57.7%  0.245 27.325);
--color-red-800: oklch(44.4%  0.177 26.899);
```

### Gray Scale
```css
--color-gray-50:  oklch(98.5%  0.002 247.839);
--color-gray-100: oklch(96.7%  0.003 264.542);
--color-gray-200: oklch(92.8%  0.006 264.531);
--color-gray-300: oklch(87.2%  0.01  258.338);
--color-gray-400: oklch(70.7%  0.022 261.325);
--color-gray-500: oklch(55.1%  0.027 264.364);
--color-gray-600: oklch(44.6%  0.03  256.802);
--color-gray-700: oklch(37.3%  0.034 259.733);
--color-gray-800: oklch(27.8%  0.033 256.848);
--color-gray-900: oklch(21%    0.034 264.665);
```

## Creating Color Scales

### Pattern for 50-900 scale:
```css
/* Start with base (500) */
--color-brand-500: oklch(62% 0.21 260);

/* Lighter shades - increase L, slightly decrease C */
--color-brand-50:  oklch(97% 0.01 260);
--color-brand-100: oklch(93% 0.03 260);
--color-brand-200: oklch(88% 0.06 260);
--color-brand-300: oklch(81% 0.11 260);
--color-brand-400: oklch(71% 0.17 260);

/* Darker shades - decrease L, adjust C as needed */
--color-brand-600: oklch(55% 0.25 262);
--color-brand-700: oklch(49% 0.24 264);
--color-brand-800: oklch(42% 0.20 266);
--color-brand-900: oklch(38% 0.15 266);
--color-brand-950: oklch(28% 0.09 268);
```

### Rules of thumb:
1. **50-400**: Gradually increase L, decrease C slightly
2. **500**: Your base color
3. **600-950**: Gradually decrease L, adjust C and H for depth

## Practical Examples

### Light/Dark Mode Pairs
```css
/* Light mode - darker, more saturated */
@theme {
  --color-primary: oklch(54.6% 0.245 262.881); /* blue-600 */
}

/* Dark mode - lighter, slightly less saturated */
.dark {
  --color-primary: oklch(70.7% 0.165 254.624); /* blue-400 */
}
```

### Semantic Colors
```css
/* Success - green around H:150 */
--color-success: oklch(62.7% 0.194 149.214);

/* Error - red around H:25 */
--color-error: oklch(63.7% 0.237 25.331);

/* Warning - amber/yellow around H:70 */
--color-warning: oklch(76.9% 0.188 70.08);

/* Info - blue around H:260 */
--color-info: oklch(62.3% 0.214 259.815);
```

### Subtle vs Vibrant
```css
/* Subtle - low chroma */
--color-subtle: oklch(60% 0.05 240);

/* Moderate - medium chroma */
--color-moderate: oklch(60% 0.15 240);

/* Vibrant - high chroma */
--color-vibrant: oklch(60% 0.30 240);
```

## Tips & Tricks

### ✅ Do's
- Keep lightness consistent for same perceived brightness
- Use small chroma values (0.01-0.05) for neutrals
- Increase chroma for vibrant accent colors
- Keep hue consistent across lightness variations
- Use OKLCH for smooth gradients

### ❌ Don'ts
- Don't exceed C:0.4 unless you need extremely saturated colors
- Don't mix L values wildly (50% looks dim next to 90%)
- Don't use percentage for chroma (use decimal)
- Don't forget alpha channel: `oklch(L C H / alpha)`

## Alpha Transparency

```css
/* With 50% opacity */
--color-overlay: oklch(62.3% 0.214 259.815 / 0.5);

/* With 20% opacity */
--color-subtle-bg: oklch(62.3% 0.214 259.815 / 0.2);

/* Fully opaque (default) */
--color-solid: oklch(62.3% 0.214 259.815 / 1);
```

## Color Conversion Tools

- **OKLCH Color Picker**: https://oklch.com/
- **Evil Martians OKLCH**: https://oklch.evilmartians.io/
- **Coloraide**: https://facelessuser.github.io/coloraide/
- **Tailwind Default Colors**: https://tailwindcss.com/docs/theme

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 111+    | ✅ Full |
| Safari  | 15.4+   | ✅ Full |
| Firefox | 113+    | ✅ Full |
| Edge    | 111+    | ✅ Full |

Older browsers automatically fall back to sRGB gamut (colors still work, just less vibrant).
