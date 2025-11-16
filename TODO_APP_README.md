# Todo App Example

This is a complete todo application showcasing the PocketBase + TanStack Query + TanStack Router + SolidJS stack.

## Features Demonstrated

### 🎯 Core Functionality
- ✅ Create todos with optimistic updates
- ✅ Toggle todo completion status instantly
- ✅ Delete todos with confirmation
- ✅ Real-time statistics (total, completed, active)
- ✅ Beautiful, responsive UI with Tailwind CSS

### ⚡ Technical Features
- **Optimistic Updates**: All mutations (create, update, delete) update the UI instantly
- **Realtime Sync**: Changes sync across all open tabs/windows automatically
- **Smart Caching**: TanStack Query handles all caching and refetching
- **Error Handling**: Automatic rollback on failures
- **Type Safety**: Full TypeScript support

## Files Created

### Routes
- `/src/routes/_authenticated/todos/index.tsx` - Main todos list page
- `/src/routes/_authenticated/todos/new.tsx` - Add new todo page

### What Makes This Special

1. **Zero Boilerplate**: Uses the reusable query hooks from `/src/lib/queries.ts`
2. **Instant Feedback**: All actions feel instant due to optimistic updates
3. **Reliable**: Automatic error recovery and server sync
4. **Scalable**: Same pattern works for any PocketBase collection

## PocketBase Setup

You mentioned you'll add the table. Here's what you need:

### Collection: `todos`

**Fields:**
- `title` (text, required)
- `completed` (bool, default: false)

The `id`, `created`, and `updated` fields are automatic.

### API Rules (Recommended)
- **List/View**: Authenticated users only
- **Create**: Authenticated users only  
- **Update**: Authenticated users only
- **Delete**: Authenticated users only

## Usage

1. Navigate to `/todos` to see the list
2. Click "Add New Todo" or press the button
3. Enter a title and submit
4. Toggle completion by clicking the checkbox
5. Delete by clicking the trash icon

## Code Highlights

### Optimistic Toggle
```tsx
const handleToggleComplete = (todo: TodoRecord) => {
  updateTodo.mutate({
    id: todo.id,
    completed: !todo.completed,
  })
}
```

The checkbox updates instantly, then syncs with server!

### Optimistic Delete
```tsx
const handleDelete = (id: string, title: string) => {
  if (confirm(`Delete "${title}"?`)) {
    setDeletingId(id)
    deleteTodo.mutate(id, {
      onSettled: () => setDeletingId(null),
    })
  }
}
```

Todo disappears immediately with visual feedback!

### Realtime Stats
```tsx
const stats = () => {
  const items = todos.data?.items || []
  return {
    total: items.length,
    completed: items.filter((t) => t.completed).length,
    active: items.filter((t) => !t.completed).length,
  }
}
```

Stats update automatically as todos change!

## Design Patterns

This todo app uses the exact same patterns as the patients example:
- Same query hooks
- Same optimistic update utilities
- Same realtime integration
- Same error handling

**The only difference is the data model!** This demonstrates how reusable and scalable the architecture is.
