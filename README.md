# SolidJS + PocketBase + TanStack Router + Realtime

A modern, production-ready template featuring **SolidJS**, **PocketBase**, and **TanStack Router** with built-in authentication, data fetching, and **realtime synchronization**.

## 🚀 Features

- ⚡ **SolidJS** - Fine-grained reactive framework for blazing-fast UIs
- 🗄️ **PocketBase** - Open-source backend with realtime database, auth, and file storage
- 🛣️ **TanStack Router** - Type-safe file-based routing with data loading
- 🔐 **Authentication** - Complete auth flow with protected routes and redirects
- 📊 **TanStack Query** - Server state management with caching and optimistic updates
- ⚡ **Realtime Sync** - Auto-syncing data across all users without manual refresh
- 🎨 **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- 📦 **TypeScript** - Full type safety across the stack
- 🔥 **HMR** - Hot module replacement with Vite for instant feedback

## ✨ NEW: Realtime Integration

This template now includes an **elegant, reusable integration** between PocketBase realtime and TanStack Query:

```tsx
// Enable realtime sync with just one line!
const patients = useCollection('patients')
useRealtimeCollection('patients')  // ✨ Auto-syncs across all users
```

**What you get:**
- 🔄 Automatic cache updates when data changes
- 🌐 Changes sync across all connected users instantly
- 🧹 Auto cleanup - no memory leaks
- 🎯 Type-safe with full TypeScript support
- 📝 Zero boilerplate

**Learn more:**
- [Realtime Integration Guide](./REALTIME_INTEGRATION.md) - Complete overview
- [Usage Examples](./REALTIME_USAGE.md) - Detailed usage guide
- [Testing Guide](./TESTING_REALTIME.md) - How to test realtime features
- [Code Examples](./src/examples/realtime-examples.tsx) - 10 working examples

│   ├── index.tsx              # Home page

│   ├── about.tsx              # About page## Deployment

│   ├── login.tsx              # Login page

│   ├── _authenticated.tsx     # Protected route layoutLearn more about deploying your application with the [documentations](https://vite.dev/guide/static-deploy.html)

│   └── _authenticated/
│       ├── dashboard.tsx      # Protected dashboard
│       └── patients.tsx       # Example with data fetching
└── index.tsx                  # App entry point
```

## 🎯 Key Patterns

### 1. Authentication Flow

The template implements a complete authentication system using PocketBase:

**lib/pocketbase.ts** - Manages PocketBase client and auth state:
```tsx
// Reactive auth state using SolidJS signals
export const [isAuthenticated, setIsAuthenticated] = createSignal(pb.authStore.isValid)
export const [currentUser, setCurrentUser] = createSignal(pb.authStore.record)

// Listen to auth changes
pb.authStore.onChange((token, record) => {
  setIsAuthenticated(!!token && !!record)
  setCurrentUser(record)
})
```

**lib/auth-context.tsx** - Provides auth methods throughout the app:
```tsx
const auth = useAuth()
auth.login(email, password)
auth.logout()
auth.user() // Get current user
auth.isAuthenticated() // Check auth status
```

### 2. Protected Routes

Using TanStack Router's `beforeLoad` for route protection:

**routes/_authenticated.tsx** - Pathless layout that wraps protected routes:
```tsx
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href }
      })
    }
  }
})
```

Any route under `_authenticated/` is automatically protected!

### 3. Data Fetching with Composable Hooks

**routes/_authenticated/patients.tsx** - Clean, reusable data fetching:
```tsx
// One line - handles loading, errors, caching automatically!
const patients = useCollection('patients', { sort: '-created' })

<Show when={patients.data}>
  {(data) => <For each={data().items}>{...}</For>}
</Show>
```

**Available hooks:**
```tsx
useCollection('items')       // Fetch paginated records
useRecord('items', () => id) // Fetch single record
useCreateRecord('items')     // Create mutation
useUpdateRecord('items')     // Update mutation  
useDeleteRecord('items')     // Delete mutation
```

### 4. Router Context Integration

**index.tsx** - Passing auth state to router context:
```tsx
const router = createRouter({ 
  routeTree,
  context: {
    auth: {
      isAuthenticated,
      user: currentUser,
    },
  },
})
```

This makes auth available in `beforeLoad` hooks and route loaders!

## 🛠️ Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure PocketBase

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

### 3. Start PocketBase

Download and run PocketBase:
```bash
# Download PocketBase (if not already installed)
# Visit https://pocketbase.io/docs/

# Start PocketBase
./pocketbase serve
```

### 4. Create Collections

In PocketBase Admin UI (http://127.0.0.1:8090/_/):

1. Create a `users` collection (auth collection)
   - Email field (required)
   - Password field (required)
   - Enable email/password authentication

2. Create a `patients` collection (base collection) for the example
   - Add any fields you want

### 5. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:5173`

## 🔐 Authentication Usage

### Login
```tsx
const auth = useAuth()

try {
  await auth.login(email, password)
  navigate('/dashboard')
} catch (err) {
  setError(err.message)
}
```

### Logout
```tsx
const auth = useAuth()
auth.logout() // Clears auth store
```

### Check Auth Status
```tsx
// Can use signals directly or through useAuth()
import { isAuthenticated, currentUser } from './lib/pocketbase'

<Show when={isAuthenticated()}>
  <p>Welcome {currentUser()?.email}</p>
</Show>
```

### OAuth2 Authentication
```tsx
await auth.loginWithOAuth2('google')
```

## 📡 Data Fetching

### Using Composable Hooks (Recommended)

```tsx
import { useCollection, useCreateRecord } from "../lib/queries"

// Fetch data
const items = useCollection('items', { sort: '-created' })

// Create mutation
const createItem = useCreateRecord('items')
createItem.mutate({ name: 'New Item' })

// Access data
<Show when={items.data}>
  {(data) => <For each={data().items}>{item => ...}</For>}
</Show>
```

### Available Query Hooks

```tsx
// Queries
useCollection('items')            // Paginated list
useRecord('items', () => id)      // Single record

// Mutations (auto-invalidate queries)
useCreateRecord('items')          // Create
useUpdateRecord('items')          // Update
useDeleteRecord('items')          // Delete
```

### Direct PocketBase Calls

```tsx
import { getList, create, update, deleteRecord } from "../lib/pocketbase"

// Get records
const records = await getList('items', 1, 50)

// Create record
const record = await create('items', data)

// Update record
await update('items', id, data)

// Delete record
await deleteRecord('items', id)
```

## 🎨 Styling

This template uses **Tailwind CSS v4** for styling. All components use Tailwind utility classes.

To customize:
- Edit `src/index.css` for global styles
- Use Tailwind classes in components
- Configure Tailwind in `vite.config.ts`

## 📦 Building for Production

```bash
pnpm build
```

Output in `dist/` directory.

Preview production build:
```bash
pnpm preview
```

## 🔧 Environment Variables

- `VITE_POCKETBASE_URL` - Your PocketBase instance URL

## 📚 Resources

- [SolidJS Documentation](https://docs.solidjs.com/)
- [PocketBase Documentation](https://pocketbase.io/docs/)
- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 🎯 Best Practices

1. **Use Composable Hooks** - `useCollection()`, `useRecord()` for consistent patterns
2. **Functions Throw Errors** - Use try/catch for error handling
3. **Type Safety** - Define TypeScript interfaces in `src/types/pocketbase-types.ts`
4. **Route Protection** - Use `beforeLoad` for authentication checks
5. **Mutations Auto-Invalidate** - Use mutation hooks for auto-cache updates
6. **Signals are Reactive** - Access `isAuthenticated()` and `currentUser()` anywhere

## 📖 Learn More

- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - See what's been improved and why
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Deep dive into patterns

## 📝 License

MIT

---

**Happy coding!** 🚀
