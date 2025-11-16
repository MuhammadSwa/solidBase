# PocketBase Realtime Integration with TanStack Query

This project includes elegant, reusable realtime integration between PocketBase and TanStack Query. Data automatically stays in sync across all users without manual refreshing.

## Features

✨ **Automatic Cache Sync** - Realtime events automatically update TanStack Query cache  
🔄 **Zero Manual Invalidation** - No need to manually call `invalidateQueries`  
🎯 **Type-Safe** - Full TypeScript support with generics  
🧹 **Auto Cleanup** - Subscriptions automatically clean up on unmount  
⚡ **Simple API** - Just one line to enable realtime for any query

## Basic Usage

### 1. Realtime Collection (All Records)

The simplest way to add realtime updates to a collection:

```tsx
import { useCollection, useRealtimeCollection } from '@/lib/queries'

function PatientsPage() {
  // Fetch patients with TanStack Query
  const patients = useCollection('patients', { sort: '-created' })
  
  // Enable realtime sync - that's it!
  useRealtimeCollection('patients')
  
  return (
    <Show when={patients.data}>
      {(data) => (
        <For each={data().items}>
          {(patient) => <PatientCard patient={patient} />}
        </For>
      )}
    </Show>
  )
}
```

**What happens automatically:**
- When a record is **created**: List queries are invalidated and refetched
- When a record is **updated**: Both detail and list caches are updated
- When a record is **deleted**: Record is removed from cache and lists refetch

### 2. Realtime Single Record

Enable realtime updates for a specific record:

```tsx
import { useRecord, useRealtimeRecord } from '@/lib/queries'
import { useParams } from '@tanstack/solid-router'

function PatientDetailPage() {
  const params = useParams()
  
  // Fetch single patient
  const patient = useRecord('patients', () => params.id)
  
  // Enable realtime sync for this specific record
  useRealtimeRecord('patients', () => params.id)
  
  return (
    <Show when={patient.data}>
      {(data) => (
        <div>
          <h1>{data().name}</h1>
          <p>Status: {data().status}</p>
        </div>
      )}
    </Show>
  )
}
```

### 3. With Custom Event Handler

Add custom logic when realtime events occur:

```tsx
import { useCollection, useRealtimeCollection } from '@/lib/queries'
import { toast } from '@/lib/toast'

function PatientsPage() {
  const patients = useCollection('patients')
  
  // Add custom handler for events
  useRealtimeCollection('patients', (event) => {
    switch (event.action) {
      case 'create':
        toast.success(`New patient added: ${event.record.name}`)
        break
      case 'update':
        toast.info(`Patient updated: ${event.record.name}`)
        break
      case 'delete':
        toast.warning(`Patient removed`)
        break
    }
  })
  
  return <PatientsList data={patients.data} />
}
```

## Advanced Usage

### Custom Subscription Logic

For complex scenarios where you need full control:

```tsx
import { useRealtimeSubscription } from '@/lib/queries'
import { useQueryClient } from '@tanstack/solid-query'
import { pb } from '@/lib/pocketbase'

function DashboardPage() {
  const queryClient = useQueryClient()
  
  useRealtimeSubscription(() => 
    pb.pb.collection('patients').subscribe('*', (e) => {
      const event = e as RealtimeEvent<Patient>
      
      // Custom cache invalidation based on patient status
      if (event.record.status === 'urgent') {
        queryClient.invalidateQueries({ queryKey: ['patients', 'urgent'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      }
    })
  )
  
  return <DashboardView />
}
```

### Filter-Based Subscriptions

Subscribe only to records matching specific criteria:

```tsx
import { useRealtimeSubscription } from '@/lib/queries'
import { useQueryClient } from '@tanstack/solid-query'
import { pb } from '@/lib/pocketbase'

function UrgentPatientsPage() {
  const queryClient = useQueryClient()
  
  // Only subscribe to urgent patients
  useRealtimeSubscription(() => 
    pb.pb.collection('patients').subscribe('*', (e) => {
      const event = e as RealtimeEvent<Patient>
      
      // Only update cache if the patient is urgent
      if (event.record.status === 'urgent') {
        queryClient.invalidateQueries({ queryKey: ['patients', 'urgent'] })
      }
    }, {
      filter: 'status = "urgent"'
    })
  )
  
  return <UrgentPatientsList />
}
```

## How It Works

### Event Flow

1. **User A** updates a patient record via mutation
2. **PocketBase** broadcasts realtime event to all connected clients
3. **User B's browser** receives the event via WebSocket
4. **useRealtimeCollection** automatically:
   - Updates the query cache with new data
   - Triggers component re-render with fresh data
5. **User B** sees the update instantly without refreshing

### Cache Strategy

- **Create events**: Invalidate list queries (refetch to show new item)
- **Update events**: 
  - Update specific record in cache (instant update)
  - Invalidate list queries (update any filtered views)
- **Delete events**: 
  - Remove record from cache
  - Invalidate list queries (update lists)

## API Reference

### `useRealtimeCollection<T>(collection, onEvent?)`

Subscribe to all records in a collection.

**Parameters:**
- `collection: string` - Collection name
- `onEvent?: (event: RealtimeEvent<T>) => void` - Optional custom event handler

**Example:**
```tsx
useRealtimeCollection('patients')
useRealtimeCollection('patients', (event) => console.log(event))
```

### `useRealtimeRecord<T>(collection, id, onEvent?)`

Subscribe to a specific record.

**Parameters:**
- `collection: string` - Collection name
- `id: () => string` - Reactive function returning record ID
- `onEvent?: (event: RealtimeEvent<T>) => void` - Optional custom event handler

**Example:**
```tsx
useRealtimeRecord('patients', () => params.id)
```

### `useRealtimeSubscription(subscribe)`

Low-level subscription with full control.

**Parameters:**
- `subscribe: () => Promise<() => void>` - Function that returns PocketBase subscription

**Example:**
```tsx
useRealtimeSubscription(() => 
  pb.pb.collection('patients').subscribe('*', handler)
)
```

## Type Safety

All realtime hooks are fully typed:

```tsx
interface Patient {
  id: string
  name: string
  status: 'active' | 'inactive' | 'urgent'
  created: string
  updated: string
}

// Full type inference
useRealtimeCollection<Patient>('patients', (event) => {
  // event.record is typed as Patient
  console.log(event.record.status) // ✅ Type-safe
})
```

## Performance Considerations

- **Automatic Cleanup**: Subscriptions are automatically unsubscribed when components unmount
- **Efficient Updates**: Only affected queries are invalidated
- **Optimistic Updates**: Combined with mutations for instant UI feedback
- **Batching**: Multiple rapid updates are automatically batched by TanStack Query

## Best Practices

### ✅ Do

- Use `useRealtimeCollection` for list views
- Use `useRealtimeRecord` for detail views
- Combine with optimistic updates in mutations
- Add custom handlers for user notifications

### ❌ Don't

- Don't subscribe to the same collection multiple times in one component
- Don't manually call `invalidateQueries` for realtime-synced data
- Don't forget the dependency on `id()` function for `useRealtimeRecord`

## Troubleshooting

### Events not updating cache?

Check that:
1. PocketBase realtime is enabled (it is by default)
2. User has read permissions for the collection
3. Query keys match between queries and realtime hooks

### Multiple subscriptions?

Each component that uses realtime hooks creates its own subscription. This is normal and efficient - PocketBase handles multiple subscriptions well.

### Stale data after navigation?

Make sure you're using reactive `id()` functions:

```tsx
// ✅ Good - reactive
useRealtimeRecord('patients', () => params.id)

// ❌ Bad - not reactive
useRealtimeRecord('patients', () => 'static-id')
```

## Migration from Manual Subscriptions

**Before (manual approach):**
```tsx
const patients = useCollection('patients')

onMount(() => {
  const unsubscribe = pb.pb.collection('patients').subscribe('*', () => {
    queryClient.invalidateQueries({ queryKey: ['patients'] })
  })
  onCleanup(() => unsubscribe.then(u => u()))
})
```

**After (automatic approach):**
```tsx
const patients = useCollection('patients')
useRealtimeCollection('patients')
```

Much cleaner! 🎉
