# ⚡ Type Inference Quick Reference

Quick cheatsheet for the automatic type inference system.

## 🎯 The 3-Step Setup

```typescript
// 1️⃣ Define record type (src/types/pocketbase-types.ts)
export interface PostsRecord extends BaseRecord {
  title: string
  content: string
  published: boolean
}

// 2️⃣ Add to appropriate collection table
interface AppCollections {
  patients: PatientsRecord
  todos: TodoRecord
  posts: PostsRecord  // ← Add this line
}

// 3️⃣ Use anywhere - automatic types! ✨
const posts = useCollection("posts")  // Typed as PostsRecord[]
```

### Organized Tables

Collections are grouped into logical tables:

```typescript
// Auth collections
interface AuthCollections {
  users: UsersRecord
}

// Application collections  
interface AppCollections {
  patients: PatientsRecord
  todos: TodoRecord
}

// Blog collections
interface BlogCollections {
  posts: PostsRecord
  comments: CommentsRecord
}

// All combined automatically via TypeScript intersection
export interface CollectionRecords 
  extends AuthCollections,
          AppCollections,
          BlogCollections {}
```

## 📚 Hook Usage

### Fetch List

```typescript
const todos = useCollection("todos", { sort: "-created" })

// Access data
todos.data?.items.forEach(todo => {
  console.log(todo.title)      // ✅ Autocomplete works!
  console.log(todo.completed)  // ✅ Type-safe!
})
```

### Fetch One

```typescript
const todo = useRecord("todos", () => params.id)

// Access data
<Show when={todo.data}>
  {(data) => <h1>{data().title}</h1>}
</Show>
```

### Create

```typescript
const createTodo = useCreateRecord("todos")

createTodo.mutate({
  title: "New todo",
  completed: false
})
```

### Update

```typescript
const updateTodo = useUpdateRecord("todos")

updateTodo.mutate({
  id: "123",
  completed: true
})
```

### Delete

```typescript
const deleteTodo = useDeleteRecord("todos")

deleteTodo.mutate("record-id")
```

### Realtime

```typescript
// Automatic sync
useRealtimeCollection("todos")

// With custom handler
useRealtimeCollection("todos", (event) => {
  console.log(event.action, event.record)
})
```

## 🔧 Common Patterns

### With Loading States

```typescript
const todos = useCollection("todos")

<Show 
  when={!todos.isLoading} 
  fallback={<div>Loading...</div>}
>
  <For each={todos.data?.items}>
    {(todo) => <div>{todo.title}</div>}
  </For>
</Show>
```

### With Error Handling

```typescript
const createTodo = useCreateRecord("todos")

createTodo.mutate(
  { title: "New", completed: false },
  {
    onSuccess: () => toast.success("Created!"),
    onError: (error) => toast.error("Failed!")
  }
)
```

### With Confirmation

```typescript
const deleteTodo = useDeleteRecord("todos")
const confirmDialog = useConfirmationDialog()

const handleDelete = (id: string, title: string) => {
  confirmDialog.confirm({
    title: "Delete Todo",
    message: `Delete "${title}"?`,
    onConfirm: () => deleteTodo.mutate(id)
  })
}
```

## 🐛 Troubleshooting

### No autocomplete?

✅ Check collection is in `CollectionRecords`:

```typescript
export interface CollectionRecords {
  todos: TodoRecord  // ← Must be here
}
```

### Wrong type?

✅ Use `const` not `let`:

```typescript
// ❌ Bad
let collection = "todos"
const data = useCollection(collection)  // Type: BaseRecord

// ✅ Good
const collection = "todos"
const data = useCollection(collection)  // Type: TodoRecord

// ✅ Best
const data = useCollection("todos")  // Type: TodoRecord
```

### Can't access fields?

✅ Make sure record interface has the field:

```typescript
export interface TodoRecord extends BaseRecord {
  title: string      // ← Must be defined
  completed: boolean // ← Must be defined
}
```

## 💡 Pro Tips

1. **Always use `const`** for collection names
2. **Add to `CollectionRecords`** for autocomplete
3. **Restart TypeScript** after changes (`Cmd+Shift+P` → "Restart TS Server")
4. **Hover variables** to see inferred types in VS Code
5. **One source of truth** - only update `CollectionRecords` to add new collections

## 📖 Full Guide

For detailed explanation, see: **[TYPE_INFERENCE_GUIDE.md](./TYPE_INFERENCE_GUIDE.md)**
