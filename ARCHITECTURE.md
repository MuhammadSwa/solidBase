# Template Architecture Overview

## File Structure

### Core Application Files

```
src/
├── index.tsx                 # App entry point with providers
├── index.css                 # Global styles and Tailwind imports
├── lib/
│   ├── pocketbase.ts        # PocketBase client & helpers
│   └── auth-context.tsx     # Authentication context provider
├── routes/
│   ├── __root.tsx           # Root layout with navigation
│   ├── index.tsx            # Home page
│   ├── about.tsx            # About page
│   ├── login.tsx            # Login page
│   ├── _authenticated.tsx   # Protected routes layout
│   └── _authenticated/
│       ├── dashboard.tsx    # Example protected page
│       └── patients.tsx     # Example with data fetching
└── types/
    └── pocketbase-types.ts  # TypeScript types for collections
```

## Architecture Patterns

### 1. Authentication System

**Three-Layer Auth Architecture:**

```
┌─────────────────────────────────────┐
│   PocketBase Auth Store             │  Layer 1: Storage
│   (Automatic persistence)           │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Reactive Signals (pocketbase.ts)  │  Layer 2: Reactivity
│   - isAuthenticated()               │
│   - currentUser()                   │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Auth Context (auth-context.tsx)   │  Layer 3: API
│   - login() / logout()              │
│   - Consumed via useAuth()          │
└─────────────────────────────────────┘
```

**Flow:**
1. PocketBase authStore automatically persists to localStorage
2. SolidJS signals react to authStore changes
3. Auth context provides convenient methods
4. Components use `useAuth()` hook

### 2. Routing Architecture

**TanStack Router + Context Integration:**

```tsx
// index.tsx - Router setup with context
const router = createRouter({
  routeTree,
  context: {
    auth: {
      isAuthenticated,  // Signal
      user: currentUser // Signal
    }
  }
})
```

**Route Protection Pattern:**

```tsx
// _authenticated.tsx - Pathless layout
beforeLoad: ({ context, location }) => {
  if (!context.auth.isAuthenticated()) {
    throw redirect({ to: '/login', search: { redirect: location.href } })
  }
}
```

**Benefits:**
- All routes under `_authenticated/` are automatically protected
- Auth state available in all `beforeLoad` hooks
- Type-safe route definitions
- Automatic code splitting per route

### 3. Data Fetching Pattern

**TanStack Query + PocketBase Integration:**

```tsx
// Component
const query = createQuery(() => ({
  queryKey: ['patients'],
  queryFn: async () => {
    const result = await dataHelpers.getList('patients')
    if (result.success) return result.data
    throw new Error('Failed to fetch')
  },
  staleTime: 1000 * 60 * 5, // 5 min cache
}))
```

**Data Helpers Pattern:**

```tsx
// All return { success: boolean, data?: any, error?: any }
await dataHelpers.getList('collection')
await dataHelpers.getOne('collection', id)
await dataHelpers.create('collection', data)
await dataHelpers.update('collection', id, data)
await dataHelpers.delete('collection', id)
```

**Benefits:**
- Consistent error handling
- Automatic caching and deduplication
- Loading and error states
- Optimistic updates support

## Key Design Decisions

### 1. Why SolidJS Signals for Auth?

```tsx
// Reactive without wrapping in components
export const [isAuthenticated, setIsAuthenticated] = createSignal(pb.authStore.isValid)

// Automatically updates all consumers
pb.authStore.onChange((token, record) => {
  setIsAuthenticated(!!token && !!record)
  setCurrentUser(record)
})
```

**Advantages:**
- Fine-grained reactivity
- No provider nesting required
- Direct integration with PocketBase
- Minimal re-renders

### 2. Why Router Context?

```tsx
// Available in beforeLoad, loaders, components
beforeLoad: ({ context }) => {
  if (!context.auth.isAuthenticated()) {
    throw redirect({ to: '/login' })
  }
}
```

**Advantages:**
- Type-safe auth checks
- Works in beforeLoad (executes before rendering)
- Centralized auth logic
- No prop drilling

### 3. Why Data Helpers?

```tsx
// Consistent error handling
const result = await dataHelpers.getList('items')
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

**Advantages:**
- Predictable return type
- Try-catch handled internally
- Easy error UI implementation
- Logging centralized

## State Management Strategy

### Application State Layers

```
┌─────────────────────────────────┐
│  Server State (TanStack Query)  │  ← Remote data, caching
├─────────────────────────────────┤
│  Auth State (Signals)           │  ← Global user state
├─────────────────────────────────┤
│  UI State (Local signals)       │  ← Forms, modals, etc.
├─────────────────────────────────┤
│  URL State (Router)             │  ← Search params, paths
└─────────────────────────────────┘
```

**When to use each:**

- **TanStack Query**: Data from PocketBase (users, posts, etc.)
- **Signals**: Global app state (auth, theme, etc.)
- **Local State**: Component-specific UI (form inputs, open/closed)
- **URL State**: Shareable state (filters, pagination, tabs)

## Extension Points

### Adding a New Protected Route

1. Create file: `src/routes/_authenticated/my-route.tsx`
2. Define route with loader (optional):

```tsx
export const Route = createFileRoute("/_authenticated/my-route")({
  loader: async ({ context }) => {
    // Fetch data - user is guaranteed authenticated
    return await dataHelpers.getList('items')
  },
  component: MyComponent
})
```

3. Route is automatically:
   - Protected by `_authenticated` layout
   - Type-safe
   - Code-split
   - Added to route tree

### Adding a New Collection

1. Create collection in PocketBase admin
2. Add type to `src/types/pocketbase-types.ts`:

```tsx
export interface MyCollectionRecord extends BaseRecord {
  title: string
  content: string
}
```

3. Use with data helpers:

```tsx
const result = await dataHelpers.getList<MyCollectionRecord>('my_collection')
```

### Adding Real-time Subscriptions

```tsx
// In a component
onMount(() => {
  pb.collection('items').subscribe('*', (e) => {
    console.log(e.action, e.record)
    // Update query cache
    queryClient.invalidateQueries(['items'])
  })
})

onCleanup(() => {
  pb.collection('items').unsubscribe()
})
```

## Performance Considerations

### Code Splitting

- Each route is automatically code-split
- Components lazy-loaded on navigation
- Reduces initial bundle size

### Caching Strategy

```tsx
// TanStack Query default config (index.tsx)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

**Customize per query:**

```tsx
createQuery(() => ({
  queryKey: ['static-data'],
  queryFn: fetchData,
  staleTime: Infinity,  // Never refetch
  cacheTime: 1000 * 60 * 60,  // 1 hour
}))
```

### Auth Refresh

Add to app initialization:

```tsx
// In a top-level component
onMount(async () => {
  await authHelpers.refreshAuth()
})
```

## Security Considerations

### 1. Auth Token Storage

- PocketBase uses httpOnly cookies (if configured)
- localStorage fallback for cross-origin
- Auto-cleanup on logout

### 2. Route Protection

- `beforeLoad` runs before component render
- Prevents flash of protected content
- Server-side protection in PocketBase API rules

### 3. API Rules

Set in PocketBase for each collection:

```javascript
// Example: Only authenticated users can read
@request.auth.id != ""

// Example: Users can only update their own records
@request.auth.id = id
```

## Testing Strategy

### Unit Tests

```tsx
import { render } from '@solidjs/testing-library'
import { AuthProvider } from './lib/auth-context'

test('login form', () => {
  const { getByLabelText } = render(
    () => <AuthProvider><LoginForm /></AuthProvider>
  )
  // ...
})
```

### Integration Tests

```tsx
// Test protected routes
test('redirects when not authenticated', async () => {
  const router = createRouter({ routeTree, context: { auth: mockAuth } })
  await router.navigate({ to: '/dashboard' })
  expect(router.state.location.pathname).toBe('/login')
})
```

## Deployment Checklist

- [ ] Update `VITE_POCKETBASE_URL` to production URL
- [ ] Run `pnpm build`
- [ ] Deploy `dist/` folder to static host
- [ ] Deploy PocketBase instance
- [ ] Configure CORS in PocketBase
- [ ] Set up backups for PocketBase data
- [ ] Configure environment variables
- [ ] Test authentication flow
- [ ] Test protected routes
- [ ] Verify API rules in PocketBase

## Common Patterns

### Loading States

```tsx
<Suspense fallback={<Loading />}>
  <Show when={!query.isLoading && query.data}>
    {/* Content */}
  </Show>
</Suspense>
```

### Error Handling

```tsx
<Show 
  when={!query.isError}
  fallback={<Error message={query.error?.message} />}
>
  {/* Content */}
</Show>
```

### Form Handling

```tsx
const [formData, setFormData] = createSignal({ email: '', password: '' })

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  const result = await auth.login(formData().email, formData().password)
  if (result.success) navigate({ to: '/dashboard' })
}
```

## Troubleshooting

### Auth not persisting

- Check PocketBase CORS settings
- Verify localStorage is enabled
- Check browser console for errors

### Types not updating

- Restart dev server
- Check `routeTree.gen.ts` is regenerated
- Run `pnpm build` to verify types

### Queries not refetching

- Check `staleTime` configuration
- Use `queryClient.invalidateQueries()`
- Verify query keys are correct

---

This architecture provides a solid foundation for building scalable SolidJS applications with PocketBase!
