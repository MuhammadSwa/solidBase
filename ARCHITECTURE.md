# Template Architecture Overview

## File Structure

### Core Application Files

```
src/
├── index.tsx                 # App entry point with providers
├── lib/
│   ├── pocketbase.ts        # PocketBase client & helpers
│   └── auth-context.tsx     # Authentication context provider
├── routes/
│   ├── __root.tsx           # Root layout with navigation
│   ├── index.tsx            # Home page
│   ├── _auth                # Authentication routes
│   ├── _authenticated.tsx   # Protected routes layout
│   └── _authenticated/
│       ├── dashboard.tsx    # Example protected page
│       └── todos/           # Example with data fetching
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

**Composable Query Hooks + TanStack Query + PocketBase:**

```tsx
// Simple, reusable hooks for all data operations
const todos = useCollection('todos', { sort: '-created' })
const createTodo = useCreateRecord('todos')
const updateTodo = useUpdateRecord('todos')
const deleteTodo = useDeleteRecord('todos')

// Enable realtime sync - updates automatically across all clients
useRealtimeCollection('todos')

// Usage - clean and declarative
<Show when={todos.data}>
  {(data) => (
    <For each={data().items}>
      {(todo) => <TodoItem todo={todo} />}
    </For>
  )}
</Show>
```

**Available Composable Hooks:**

```tsx
// Queries (fetching data)
useCollection('items', options)  // Fetch paginated list
useRecord('items', () => id)     // Fetch single record by ID

// Mutations (modifying data with optimistic updates)
useCreateRecord('items')         // Create with instant UI feedback
useUpdateRecord('items')         // Update with instant UI feedback
useDeleteRecord('items')         // Delete with instant UI feedback

// Realtime sync
useRealtimeCollection('items')   // Auto-sync collection changes
useRealtimeRecord('items', () => id)  // Auto-sync single record
```

**Optimistic Updates Pattern:**

```tsx
// All mutations update UI immediately, sync with server in background
const deleteTodo = useDeleteRecord('todos')

// Item disappears instantly, then confirms with server
deleteTodo.mutate(id)

// Automatic rollback if server fails - no extra code needed!
```

**Benefits:**
- **Zero boilerplate** - One-line data fetching
- **Optimistic updates** - Instant UI feedback on all mutations
- **Automatic caching** - Smart cache invalidation and deduplication
- **Realtime sync** - Live updates across all connected clients
- **Error recovery** - Automatic rollback on failures
- **Type safety** - Full TypeScript support with generics
- **Reusable** - Same hooks work for any PocketBase collection
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

### 3. Why Composable Query Hooks?

```tsx
// Clean, declarative data fetching
const todos = useCollection('todos', { sort: '-created' })
const deleteTodo = useDeleteRecord('todos')

// One line enables realtime sync
useRealtimeCollection('todos')
```

**Advantages:**
- **DRY principle** - Reusable across all collections
- **Optimistic updates** - Built-in, no configuration needed
- **Type safety** - Generic types for compile-time safety
- **Scalable** - Add new collections without new code
- **Testable** - Easy to mock and test
- **Maintainable** - Single source of truth for data logic

## State Management Strategy
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
  component: MyComponent
})

function MyComponent() {
  // Use composable hooks - data fetching is handled automatically
  const items = useCollection('items', { sort: '-created' })
  
  return (
    <Show when={items.data}>
      {(data) => <For each={data().items}>{...}</For>}
    </Show>
  )
}
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
export interface MyCollectionRecord {
  id: string
  title: string
  content: string
  created: string
  updated: string
}
```

3. Use with composable hooks:

```tsx
// In your component
const items = useCollection<MyCollectionRecord>('my_collection')
const createItem = useCreateRecord<MyCollectionRecord>('my_collection')
const updateItem = useUpdateRecord<MyCollectionRecord>('my_collection')
const deleteItem = useDeleteRecord('my_collection')

// Enable realtime sync
useRealtimeCollection('my_collection')

// That's it! Full CRUD with optimistic updates and realtime sync
```

### Adding Real-time Subscriptions

Realtime sync is built into the composable hooks:

```tsx
// Automatic realtime sync for a collection
useRealtimeCollection('items')

// Automatic realtime sync for a specific record
useRealtimeRecord('items', () => id)

// Changes automatically update TanStack Query cache
// No manual subscription management needed!
```

**Manual subscriptions (if needed):**

```tsx
// In a component
onMount(() => {
  const unsubscribe = pb.collection('items').subscribe('*', (e) => {
    console.log(e.action, e.record)
    // Update query cache manually
    queryClient.invalidateQueries({ queryKey: ['items', 'list'] })
  })
  
  // Cleanup on unmount
  onCleanup(() => {
    unsubscribe.then((fn) => fn())
  })
})
```

## Performance Considerations
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
