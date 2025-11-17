## 🎨 Toast Component API

### Usage

```tsx
import { toast } from '@/lib/toast'

// Success (green)
toast.success('Operation completed!')
toast.success('Custom duration', 5000)

// Error (red)
toast.error('Something went wrong')

// Info (blue)
toast.info('FYI: New feature available')

// Warning (yellow)
toast.warning('Are you sure?')
```

### Toast Container

Already added to `__root.tsx`, no need to add elsewhere:

```tsx
<ToastContainer />
```

## 🎓 Best Practices

### When to Use Toasts

✅ **Do use for:**
- Confirmation of actions (login, logout, save, delete)
- Non-critical errors (failed to load optional data)
- Success messages (record created, updated)
- Temporary information (copied to clipboard)

❌ **Don't use for:**
- Critical errors (use modal/alert instead)
- Information user needs to act on immediately
- Long messages (use notification panel)
- Persistent information (use banner/alert)

### Toast Duration Guidelines

- **Success:** 2-3 seconds
- **Info:** 3-4 seconds
- **Warning:** 4-5 seconds
- **Error:** 5-6 seconds (or manual dismiss only)

## 🔮 Future Enhancements
- [ ] Toast queue/stacking improvements
- [ ] Action buttons in toasts ("Undo", "View")
- [ ] Progress bar showing time until auto-dismiss
- [ ] Sound effects (optional)
- [ ] Persist important toasts across navigation
