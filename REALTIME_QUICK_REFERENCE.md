# 🎯 Realtime Quick Reference

One-page cheat sheet for PocketBase + TanStack Query realtime integration.

## 📦 Import

```tsx
import { 
  useRealtimeCollection,
  useRealtimeRecord,
  useRealtimeSubscription 
} from '@/lib/queries'
```

## 🔥 Basic Usage

### Collection (All Records)

```tsx
// Before
const patients = useCollection('patients')

// After - Add one line!
const patients = useCollection('patients')
useRealtimeCollection('patients')  // ✨
```

### Single Record

```tsx
const patient = useRecord('patients', () => params.id)
useRealtimeRecord('patients', () => params.id)  // ✨
```

## 🎨 With Custom Handlers

```tsx
useRealtimeCollection('patients', (event) => {
  console.log(event.action)   // 'create' | 'update' | 'delete'
  console.log(event.record)   // { id: '...', ... }
})
```

## 💡 Common Patterns

### Dashboard

```tsx
function Dashboard() {
  const total = useCollection('patients')
  const active = useCollection('patients', { filter: 'active=true' })
  
  useRealtimeCollection('patients')
  
  return (
    <div>
      <Stat value={total.data?.totalItems} />
      <Stat value={active.data?.totalItems} />
    </div>
  )
}
```

### Master-Detail

```tsx
function MasterDetail() {
  const [id, setId] = createSignal<string>()
  
  const list = useCollection('patients')
  const detail = useRecord('patients', id)
  
  useRealtimeCollection('patients')
  useRealtimeRecord('patients', id)
  
  return <SplitView list={list} detail={detail} />
}
```

### CRUD

```tsx
function PatientsCRUD() {
  const patients = useCollection('patients')
  const create = useCreateRecord('patients')
  const update = useUpdateRecord('patients')
  const remove = useDeleteRecord('patients')
  
  useRealtimeCollection('patients')
  
  return (
    <DataTable
      data={patients.data}
      onCreate={(data) => create.mutate(data)}
      onUpdate={(data) => update.mutate(data)}
      onDelete={(id) => remove.mutate(id)}
    />
  )
}
```

### Multiple Collections

```tsx
function MultiCollection() {
  const patients = useCollection('patients')
  const doctors = useCollection('doctors')
  const appointments = useCollection('appointments')
  
  // Each syncs independently
  useRealtimeCollection('patients')
  useRealtimeCollection('doctors')
  useRealtimeCollection('appointments')
  
  return <Dashboard {...{ patients, doctors, appointments }} />
}
```

## 🛠️ Advanced

### Custom Cache Logic

```tsx
const queryClient = useQueryClient()

useRealtimeSubscription(() =>
  pb.pb.collection('patients').subscribe('*', (e) => {
    const event = e as RealtimeEvent<Patient>
    
    // Custom invalidation
    if (event.record.status === 'urgent') {
      queryClient.invalidateQueries({ 
        queryKey: ['urgent-patients'] 
      })
    }
  })
)
```

### Filtered Subscription

```tsx
useRealtimeSubscription(() =>
  pb.pb.collection('patients').subscribe('*', handler, {
    filter: 'status="active"'
  })
)
```

## 📊 Event Types

```tsx
interface RealtimeEvent<T> {
  action: 'create' | 'update' | 'delete'
  record: T  // Full record data
}
```

## 🎯 Cache Behavior

| Event | Cache Action |
|-------|--------------|
| `create` | Invalidate lists → Refetch |
| `update` | Update record + Invalidate lists |
| `delete` | Remove record + Invalidate lists |

## ✅ Checklist

- [ ] Import realtime hook
- [ ] Call hook in component body
- [ ] Match collection name with query
- [ ] Use reactive ID accessor for records
- [ ] Test with two browser windows

## 🐛 Common Issues

### Not updating?
```tsx
// ✅ Do this
useRealtimeCollection('patients')

// ❌ Not this (missing!)
const patients = useCollection('patients')
// Forgot to add realtime hook!
```

### Wrong ID?
```tsx
// ✅ Reactive
useRealtimeRecord('patients', () => params.id)

// ❌ Static
useRealtimeRecord('patients', () => 'abc123')
```

### Multiple subscriptions?
```tsx
// ❌ Don't subscribe twice
useRealtimeCollection('patients')
useRealtimeCollection('patients')  // Remove this!

// ✅ Subscribe once
useRealtimeCollection('patients')
```

## 🎓 Tips

1. **One hook per component** - Don't subscribe multiple times
2. **Use reactive IDs** - Always use `() => id` not just `id`
3. **Match query keys** - Collection name must match
4. **Auth matters** - Users only see what they have permission for
5. **Check console** - Look for WebSocket connection

## 🚀 Quick Test

```bash
# Terminal 1
./pocketbase serve

# Terminal 2
npm run dev

# Browser
# 1. Open http://localhost:5173/patients
# 2. Open second window with same URL
# 3. Create/update/delete in one window
# 4. See instant update in other window ✨
```

## 📚 More Info

- [Full Guide](./REALTIME_INTEGRATION.md)
- [Usage Examples](./REALTIME_USAGE.md)
- [Testing](./TESTING_REALTIME.md)
- [Code Examples](./src/examples/realtime-examples.tsx)

---

**Remember**: Just add `useRealtimeCollection()` and you're done! 🎉
