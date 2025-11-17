# 🎨 Dark Mode Quick Reference

## Component Patterns

### Backgrounds
```tsx
// Page background
<div class="bg-gray-50 dark:bg-gray-900">

// Card/Container
<div class="bg-white dark:bg-gray-800">

// Secondary background
<div class="bg-gray-100 dark:bg-gray-700">
```

### Text
```tsx
// Headings
<h1 class="text-gray-900 dark:text-gray-100">

// Body text
<p class="text-gray-600 dark:text-gray-400">

// Muted text
<span class="text-gray-500 dark:text-gray-500">
```

### Borders
```tsx
// Standard border
<div class="border border-gray-200 dark:border-gray-700">

// Input border
<input class="border-gray-300 dark:border-gray-600">
```

### Buttons
```tsx
// Primary button
<button class="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white">

// Secondary button
<button class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600">

// Danger button
<button class="bg-red-600 dark:bg-red-500 text-white">
```

### Forms
```tsx
// Input field
<input class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400">

// Label
<label class="text-gray-700 dark:text-gray-300">
```

### Info Boxes
```tsx
// Blue info
<div class="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
  <p class="text-blue-800 dark:text-blue-300">

// Green success
<div class="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
  <p class="text-green-800 dark:text-green-300">

// Red error
<div class="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
  <p class="text-red-800 dark:text-red-300">
```

### Tables
```tsx
// Table
<table class="divide-y divide-gray-200 dark:divide-gray-700">
  <thead class="bg-gray-50 dark:bg-gray-900">
    <th class="text-gray-500 dark:text-gray-400">
  </thead>
  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td class="text-gray-900 dark:text-gray-100">
```

### Links
```tsx
<Link class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
```

### Badges
```tsx
// Admin badge
<span class="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">

// Status badge
<span class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
```

### Gradients
```tsx
// Background gradient
<div class="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
```

## Color Palette

### Gray Scale
- **bg-white** → **dark:bg-gray-900**
- **bg-gray-50** → **dark:bg-gray-800**
- **bg-gray-100** → **dark:bg-gray-700**
- **text-gray-900** → **dark:text-gray-100**
- **text-gray-600** → **dark:text-gray-400**
- **border-gray-200** → **dark:border-gray-700**
- **border-gray-300** → **dark:border-gray-600**

### Blue
- **bg-blue-600** → **dark:bg-blue-500**
- **bg-blue-700** → **dark:bg-blue-600**
- **text-blue-600** → **dark:text-blue-400**
- **bg-blue-50** → **dark:bg-blue-900/30**
- **border-blue-200** → **dark:border-blue-800**
- **text-blue-800** → **dark:text-blue-300**

### Other Colors
Same pattern: lighter in dark mode for backgrounds, adjust opacity for info boxes

## Testing

```bash
# Open in browser
http://localhost:5174/

# Toggle theme in top-right navigation
# Test all these pages:
- / (home)
- /about
- /login
- /signup
- /dashboard
- /patients
- /patients/new
- /todos
- /todos/new
```

## Tips

1. **Always pair text and background colors** for proper contrast
2. **Use semi-transparent backgrounds** (`/30`) for layered effects in info boxes
3. **Test interactive states** (hover, focus, disabled) in both themes
4. **Check forms carefully** - inputs need dark backgrounds in dark mode
5. **Gradients need both light and dark variants** for smooth transitions
