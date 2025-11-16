# ✨ PocketBase Realtime + TanStack Query Integration

A **simple, elegant, and reusable** integration between PocketBase's realtime features and TanStack Query that keeps your data fresh across all users without manual refreshing.

## 🎯 What This Gives You

- **Automatic Cache Sync**: Realtime events automatically update TanStack Query cache
- **Zero Boilerplate**: One line of code to enable realtime for any query
- **Type-Safe**: Full TypeScript support with generics
- **Auto Cleanup**: Subscriptions clean up automatically on unmount
- **Production Ready**: Based on latest PocketBase and TanStack Query docs

## 📦 Files Added/Modified

### Core Integration
- **`src/lib/queries.ts`** - Added three new hooks:
  - `useRealtimeCollection()` - Sync all records in a collection
  - `useRealtimeRecord()` - Sync a specific record
  - `useRealtimeSubscription()` - Advanced custom subscriptions

### Documentation
- **`REALTIME_USAGE.md`** - Complete usage guide with examples
- **`src/examples/realtime-examples.tsx`** - 10 working examples

### Demo
- **`src/routes/_authenticated/patients.tsx`** - Updated to use realtime

## 🚀 Quick Start

### 1. Enable Realtime for a List

```tsx
import { useCollection, useRealtimeCollection } from '@/lib/queries'

function PatientsPage() {
  const patients = useCollection('patients')
  useRealtimeCollection('patients')  // ✨ That's it!
  
  return <PatientsList data={patients.data} />
}
```

### 2. Enable Realtime for a Detail View

```tsx
import { useRecord, useRealtimeRecord } from '@/lib/queries'

function PatientDetail() {
  const params = useParams()
  const patient = useRecord('patients', () => params.id)
  useRealtimeRecord('patients', () => params.id)  // ✨ Auto-syncs!
  
  return <PatientInfo data={patient.data} />
}
```

## 🔄 How It Works

### Event Flow

```
User A creates/updates/deletes a record
         ↓
PocketBase broadcasts realtime event
         ↓
All connected clients receive event via WebSocket
         ↓
useRealtimeCollection() auto-updates TanStack Query cache
         ↓
Components re-render with fresh data
         ↓
Users see changes instantly! ✨
```

### Cache Update Strategy

| Event Type | What Happens |
|------------|--------------|
| **Create** | Invalidates list queries → Refetches to show new item |
| **Update** | Updates specific record in cache → Invalidates lists |
| **Delete** | Removes from cache → Invalidates lists |

## 🎨 Features

### ✅ Works With Existing Code
No need to refactor! Just add `useRealtimeCollection()` to components that use `useCollection()`.

### ✅ Custom Event Handlers
```tsx
useRealtimeCollection('patients', (event) => {
  if (event.action === 'create') {
    toast.success('New patient added!')
  }
})
```

### ✅ Multiple Collections
```tsx
useRealtimeCollection('patients')
useRealtimeCollection('appointments')
useRealtimeCollection('doctors')
```

### ✅ Filtered Updates
```tsx
const queryClient = useQueryClient()
useRealtimeSubscription(() =>
  pb.pb.collection('patients').subscribe('*', (e) => {
    if (e.record.status === 'urgent') {
      queryClient.invalidateQueries({ queryKey: ['urgent-patients'] })
    }
  })
)
```

## 📖 API Reference

### `useRealtimeCollection<T>(collection, onEvent?)`

Subscribe to all records in a collection and auto-sync cache.

**Parameters:**
- `collection: string` - Collection name
- `onEvent?: (event) => void` - Optional custom handler

**Example:**
```tsx
useRealtimeCollection('patients')
useRealtimeCollection('patients', (e) => console.log(e.action, e.record))
```

---

### `useRealtimeRecord<T>(collection, id, onEvent?)`

Subscribe to a specific record and auto-sync cache.

**Parameters:**
- `collection: string` - Collection name
- `id: () => string` - Reactive ID accessor
- `onEvent?: (event) => void` - Optional custom handler

**Example:**
```tsx
useRealtimeRecord('patients', () => params.id)
```

---

### `useRealtimeSubscription(subscribe)`

Low-level API for custom subscription logic.

**Parameters:**
- `subscribe: () => Promise<() => void>` - Subscription function

**Example:**
```tsx
const queryClient = useQueryClient()
useRealtimeSubscription(() => 
  pb.pb.collection('patients').subscribe('*', (e) => {
    // Custom cache logic
    queryClient.invalidateQueries({ queryKey: ['custom-key'] })
  })
)
```

## 🎯 Common Patterns

### Dashboard with Real-Time Stats

```tsx
function Dashboard() {
  const totalPatients = useCollection('patients')
  const activePatients = useCollection('patients', { filter: 'active=true' })
  
  useRealtimeCollection('patients')
  
  return (
    <div>
      <StatCard title="Total" value={totalPatients.data?.totalItems} />
      <StatCard title="Active" value={activePatients.data?.totalItems} />
    </div>
  )
}
```

### Master-Detail with Realtime

```tsx
function MasterDetail() {
  const [selected, setSelected] = createSignal<string>()
  
  const list = useCollection('patients')
  const detail = useRecord('patients', selected)
  
  useRealtimeCollection('patients')
  useRealtimeRecord('patients', selected)
  
  return (
    <div>
      <Sidebar items={list.data} onSelect={setSelected} />
      <Detail data={detail.data} />
    </div>
  )
}
```

### CRUD with Realtime Sync

```tsx
function PatientManager() {
  const patients = useCollection('patients')
  const create = useCreateRecord('patients')
  const update = useUpdateRecord('patients')
  const remove = useDeleteRecord('patients')
  
  // Everyone sees changes in realtime!
  useRealtimeCollection('patients')
  
  return <CRUDInterface {...{ patients, create, update, remove }} />
}
```

## 🔧 Technical Details

### Type Safety

All hooks are fully typed with generics:

```tsx
interface Patient {
  id: string
  name: string
  status: 'active' | 'inactive'
}

useRealtimeCollection<Patient>('patients', (event) => {
  // event.record is typed as Patient ✅
  console.log(event.record.status)
})
```

### Performance

- **Automatic Cleanup**: Subscriptions unsubscribe on unmount
- **Efficient Updates**: Only affected queries are invalidated
- **Batching**: TanStack Query batches multiple rapid updates
- **Smart Caching**: Uses existing query keys for updates

### Authentication

PocketBase realtime automatically respects authentication:
- Subscriptions use current auth state
- Only sends events for records the user can read
- Gracefully handles auth changes

## 🛠️ Troubleshooting

### Data Not Updating?

Check:
1. ✅ PocketBase realtime is enabled (default)
2. ✅ User has read permissions
3. ✅ Query keys match between queries and hooks

### Multiple Subscriptions?

This is normal! Each component creates its own subscription. PocketBase handles this efficiently.

### Stale Data After Navigation?

Use reactive functions for IDs:

```tsx
// ✅ Good
useRealtimeRecord('patients', () => params.id)

// ❌ Bad
useRealtimeRecord('patients', () => 'static-id')
```

## 🎓 Learn More

- **[REALTIME_USAGE.md](./REALTIME_USAGE.md)** - Complete usage guide
- **[src/examples/realtime-examples.tsx](./src/examples/realtime-examples.tsx)** - 10 working examples
- **[PocketBase Realtime Docs](https://pocketbase.io/docs/api-realtime/)** - Official docs
- **[TanStack Query](https://tanstack.com/query)** - Query library docs

## 📝 Migration

**Before:**
```tsx
const patients = useCollection('patients')

onMount(() => {
  const unsub = pb.pb.collection('patients').subscribe('*', () => {
    queryClient.invalidateQueries({ queryKey: ['patients'] })
  })
  onCleanup(() => unsub.then(u => u()))
})
```

**After:**
```tsx
const patients = useCollection('patients')
useRealtimeCollection('patients')
```

70% less code! 🎉

## 🌟 Next Steps

1. **Try it**: Add `useRealtimeCollection('patients')` to your patients page
2. **Test it**: Open two browser windows and watch real-time sync!
3. **Extend it**: Use custom handlers for notifications, logging, analytics
4. **Scale it**: Works with any PocketBase collection out of the box

---

Built with ❤️ using:
- [PocketBase](https://pocketbase.io) - Open source backend
- [TanStack Query](https://tanstack.com/query) - Powerful data fetching
- [SolidJS](https://solidjs.com) - Reactive UI framework

**Happy coding!** ✨
