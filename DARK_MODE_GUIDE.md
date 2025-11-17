# Dark Mode Implementation Guide

This project uses **Tailwind CSS v4** with a custom dark mode implementation that supports three themes: Light, Dark, and System.

## Overview

Dark mode is implemented using:
- **Tailwind CSS v4** `@custom-variant` for dark mode configuration
- **Class-based dark mode** (`.dark` class on `<html>` element)
- **localStorage** for persisting user preference
- **System theme detection** via `prefers-color-scheme` media query
- **FOUC prevention** with inline script in `index.html`

## Architecture

### 1. CSS Configuration (`src/index.css`)

```css
@import "tailwindcss";

/* Configure dark mode to use class-based approach */
@custom-variant dark (&:where(.dark, .dark *));
```

This configures Tailwind v4 to apply dark mode styles when the `.dark` class is present on any parent element (typically `<html>`).

### 2. Dark Mode Toggle Component (`src/lib/dark-mode-toggle.tsx`)

The `DarkModeToggle` component provides:
- **Three-way toggle**: Light → System → Dark → Light...
- **Visual indicators**: ☀️ (Light), 💻 (System), 🌙 (Dark)
- **Reactive theme switching** using SolidJS signals
- **localStorage persistence**
- **System theme detection**

**How it works:**
```tsx
const [theme, setTheme] = createSignal<Theme>("system")

createEffect(() => {
  if (theme() === "dark") {
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "dark")
  } else if (theme() === "light") {
    document.documentElement.classList.remove("dark")
    localStorage.setItem("theme", "light")
  } else {
    // System theme
    localStorage.removeItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.classList.toggle("dark", prefersDark)
  }
})
```

### 3. FOUC Prevention (`index.html`)

The inline script in `<head>` runs **before** the page renders to prevent flash of unstyled content:

```html
<script>
  (function() {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### 4. Theme Persistence

- **Light mode**: `localStorage.theme = "light"`
- **Dark mode**: `localStorage.theme = "dark"`
- **System mode**: `localStorage.theme` is removed (uses OS preference)

## Using Dark Mode in Your Components

Simply add the `dark:` variant to any Tailwind class:

```tsx
// Background colors
<div class="bg-white dark:bg-gray-800">

// Text colors
<p class="text-gray-900 dark:text-gray-100">

// Borders
<div class="border-gray-200 dark:border-gray-700">

// Hover states
<button class="hover:bg-gray-100 dark:hover:bg-gray-700">

// Multiple properties
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
```

## Example Implementations

### Navigation Bar (from `__root.tsx`)

```tsx
<div class="p-2 flex gap-4 items-center border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
  <Link to="/" class="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
    Home
  </Link>
</div>
```

### Buttons

```tsx
// Primary button
<button class="px-4 py-1 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600">
  Submit
</button>

// Secondary button
<button class="px-4 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600">
  Cancel
</button>
```

### Cards

```tsx
<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
    Card Title
  </h3>
  <p class="text-gray-600 dark:text-gray-400">
    Card description
  </p>
</div>
```

## Color Palette Recommendations

For consistent dark mode styling, use these Tailwind color combinations:

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background (primary) | `bg-white` | `bg-gray-900` |
| Background (secondary) | `bg-gray-50` | `bg-gray-800` |
| Background (tertiary) | `bg-gray-100` | `bg-gray-700` |
| Text (primary) | `text-gray-900` | `text-gray-100` |
| Text (secondary) | `text-gray-600` | `text-gray-400` |
| Text (muted) | `text-gray-500` | `text-gray-500` |
| Border | `border-gray-200` | `border-gray-700` |
| Accent (blue) | `bg-blue-600` | `bg-blue-500` |
| Accent hover | `hover:bg-blue-700` | `hover:bg-blue-600` |

## Adding Dark Mode to Existing Components

To add dark mode to existing components, follow these steps:

1. **Identify backgrounds**: Add `dark:bg-*` variants
2. **Update text colors**: Add `dark:text-*` variants  
3. **Fix borders**: Add `dark:border-*` variants
4. **Handle interactive states**: Add `dark:hover:*`, `dark:focus:*` variants
5. **Test both themes**: Toggle between light and dark to verify contrast

## Advanced Usage

### Conditional Rendering Based on Theme

If you need to render different components based on theme:

```tsx
import { createSignal, onMount } from "solid-js"

const [isDark, setIsDark] = createSignal(false)

onMount(() => {
  const checkTheme = () => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }
  checkTheme()
  
  // Listen for theme changes
  const observer = new MutationObserver(checkTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})
```

### System Theme Change Detection

To respond to OS theme changes while in "System" mode:

```tsx
onMount(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.classList.toggle('dark', e.matches)
    }
  }
  mediaQuery.addEventListener('change', handleChange)
  
  onCleanup(() => mediaQuery.removeEventListener('change', handleChange))
})
```

## Testing Dark Mode

1. **Manual Testing**:
   - Click the theme toggle in the navigation bar
   - Verify smooth transitions between Light → System → Dark
   - Check that preference persists on page reload

2. **Visual Testing**:
   - Verify all text is readable in both modes
   - Check contrast ratios meet WCAG standards
   - Ensure interactive elements are visible

3. **Browser DevTools**:
   - Open DevTools → Rendering → Emulate CSS media feature `prefers-color-scheme`
   - Test "System" mode with both light and dark OS preferences

## Troubleshooting

### Dark mode not applying
- Check if `dark` class is on `<html>` element (inspect in DevTools)
- Verify `@custom-variant` is in `src/index.css`
- Clear localStorage and browser cache

### Flash of unstyled content (FOUC)
- Ensure inline script in `index.html` runs before body
- Script should be in `<head>`, not at end of `<body>`

### Theme not persisting
- Check browser console for localStorage errors
- Verify localStorage is not disabled in browser settings
- Check incognito/private mode behavior

## Resources

- [Tailwind CSS v4 Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [Web.dev: prefers-color-scheme](https://web.dev/prefers-color-scheme/)

## Migration Notes

If updating existing components:

1. Search for background colors: `bg-white`, `bg-gray-*`
2. Add corresponding dark variants
3. Update text colors for sufficient contrast
4. Test all interactive states (hover, focus, active)
5. Pay special attention to form inputs and modals
