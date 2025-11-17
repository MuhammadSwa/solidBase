import { createFileRoute, Link, useNavigate } from "@tanstack/solid-router"
import { Show, Suspense, createSignal } from "solid-js"
import { useRecord, useUpdateRecord, useDeleteRecord, useRealtimeRecord } from "@/lib/queries"
import { useConfirmationDialog } from "@/components/confirmation-dialog"
import { PageLayout, PageContainer, Card } from "@/components/ui"

export const Route = createFileRoute("/_authenticated/todos/$id")({
  component: TodoDetailPage,
})

/**
 * 🎯 Individual Todo Detail Page
 * ================================
 * 
 * This page demonstrates:
 * 1. 📄 useRecord - Fetch a single PocketBase record by ID
 * 2. 🔄 useRealtimeRecord - Subscribe to realtime updates for ONE specific record
 * 3. ✏️ useUpdateRecord - Update the record with optimistic updates
 * 4. 🗑️ useDeleteRecord - Delete the record with optimistic updates
 * 
 * 🚀 KEY FEATURES:
 * ----------------
 * - Type-safe query with automatic type inference (TodoRecord)
 * - Realtime sync - changes from other users appear instantly
 * - Optimistic updates - UI updates before server confirms
 * - Automatic error handling and loading states
 * - Toggle completion status with instant feedback
 * 
 * 📖 USAGE:
 * ---------
 * Navigate to: /todos/{record-id}
 * Try toggling completion in two browser windows - watch it sync in realtime!
 */
function TodoDetailPage() {
  const params = Route.useParams()
  const navigate = useNavigate()
  
  // 📄 Fetch the specific todo record
  // TypeScript knows this returns TodoRecord automatically!
  const todo = useRecord("todos", () => params().id)
  
  // 🔄 Subscribe to realtime updates for THIS specific todo
  // When another user updates this todo, the cache automatically updates
  useRealtimeRecord("todos", () => params().id, (event) => {
    console.log("🔄 Realtime event for todo:", event.action, event.record)
  })
  
  // ✏️ Update mutation with optimistic updates
  const updateTodo = useUpdateRecord("todos")
  
  // 🗑️ Delete mutation
  const deleteTodo = useDeleteRecord("todos")
  const confirmDialog = useConfirmationDialog()
  
  // Local state for editing
  const [isEditing, setIsEditing] = createSignal(false)
  const [editTitle, setEditTitle] = createSignal("")
  
  const handleStartEdit = (currentTitle: string) => {
    setEditTitle(currentTitle)
    setIsEditing(true)
  }
  
  const handleSave = () => {
    updateTodo.mutate(
      {
        id: params().id,
        title: editTitle(),
      },
      {
        onSuccess: () => {
          setIsEditing(false)
        },
      }
    )
  }
  
  const handleCancel = () => {
    setIsEditing(false)
    setEditTitle("")
  }
  
  const handleToggleComplete = (currentCompleted: boolean) => {
    updateTodo.mutate({
      id: params().id,
      completed: !currentCompleted,
    })
  }
  
  const handleDelete = (title: string) => {
    confirmDialog.confirm({
      title: "Delete Todo",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: () => {
        deleteTodo.mutate(params().id, {
          onSuccess: () => {
            navigate({ to: "/todos" })
          },
        })
      },
    })
  }
  
  return (
    <>
      <confirmDialog.ConfirmationDialog />
      <PageLayout variant="gradient">
        <PageContainer size="lg">
          <div class="mb-6">
            <Link
              to="/todos"
              class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-bg-secondary)] transition border border-[var(--color-border-primary)] shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Todos
            </Link>
          </div>
          
          <Suspense
            fallback={
              <Card>
                <div class="p-8 text-center">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-primary)]"></div>
                  <p class="mt-2 text-[var(--color-text-tertiary)]">Loading todo...</p>
                </div>
              </Card>
            }
          >
            <Show
              when={!todo.isLoading && todo.data}
              fallback={
                <Card>
                  <div class="p-8 text-center">
                    <Show when={todo.isError}>
                      <p class="text-[var(--color-error)]">
                        Error: {todo.error?.message || "Failed to load todo"}
                      </p>
                    </Show>
                  </div>
                </Card>
              }
            >
              {(data) => (
                <div class="space-y-6">
                  {/* Main Todo Card */}
                  <Card>
                    <div class="p-6">
                      <div class="flex items-start justify-between mb-6">
                        <div class="flex items-start gap-4 flex-1">
                          {/* Completion Checkbox */}
                          <button
                            onClick={() => handleToggleComplete(data().completed)}
                            class={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                              data().completed
                                ? "bg-[var(--color-success)] border-[var(--color-success)]"
                                : "border-[var(--color-border-primary)] hover:border-[var(--color-brand-primary)]"
                            }`}
                            disabled={updateTodo.isPending}
                          >
                            {data().completed && (
                              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          
                          <div class="flex-1">
                            <h2 class={`text-2xl font-bold mb-1 ${
                              data().completed 
                                ? "text-[var(--color-text-tertiary)] line-through" 
                                : "text-[var(--color-text-primary)]"
                            }`}>
                              {data().title}
                            </h2>
                            <p class="text-sm text-[var(--color-text-tertiary)]">
                              Todo ID: {data().id}
                            </p>
                            <div class="mt-2">
                              <span class={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                data().completed
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                              }`}>
                                {data().completed ? "✅ Completed" : "⏳ Active"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div class="flex gap-2">
                          <button
                            onClick={() => handleStartEdit(data().title)}
                            class="px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded hover:bg-[var(--color-brand-primary-hover)] transition"
                            disabled={isEditing()}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(data().title)}
                            class="px-4 py-2 bg-[var(--color-error)] text-white rounded hover:opacity-90 transition"
                            disabled={deleteTodo.isPending}
                          >
                            {deleteTodo.isPending ? "Deleting..." : "🗑️ Delete"}
                          </button>
                        </div>
                      </div>
                      
                      {/* Edit Form */}
                      <Show when={isEditing()}>
                        <div class="mb-6 p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)]">
                          <label class="block mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                            Todo Title
                          </label>
                          <input
                            type="text"
                            value={editTitle()}
                            onInput={(e) => setEditTitle(e.currentTarget.value)}
                            class="w-full px-3 py-2 bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] text-[var(--color-text-primary)]"
                            placeholder="Enter todo title"
                          />
                          <div class="flex gap-2 mt-3">
                            <button
                              onClick={handleSave}
                              class="px-4 py-2 bg-[var(--color-success)] text-white rounded hover:opacity-90 transition"
                              disabled={updateTodo.isPending || !editTitle().trim()}
                            >
                              {updateTodo.isPending ? "Saving..." : "💾 Save"}
                            </button>
                            <button
                              onClick={handleCancel}
                              class="px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded hover:bg-[var(--color-bg-secondary)] transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </Show>
                      
                      {/* Metadata */}
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <p class="text-sm text-[var(--color-text-tertiary)] mb-1">Created</p>
                          <p class="text-[var(--color-text-primary)] font-medium">
                            {new Date(data().created).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p class="text-sm text-[var(--color-text-tertiary)] mb-1">Last Updated</p>
                          <p class="text-[var(--color-text-primary)] font-medium">
                            {new Date(data().updated).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Demo Info Card */}
                  <Card>
                    <div class="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                      <h3 class="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                        🎯 What's Happening Here?
                      </h3>
                      <div class="space-y-2 text-sm text-[var(--color-text-secondary)]">
                        <div class="flex items-start gap-2">
                          <span class="text-lg">📄</span>
                          <div>
                            <strong>useRecord:</strong> Fetches THIS specific todo by ID with automatic type safety (TodoRecord)
                          </div>
                        </div>
                        <div class="flex items-start gap-2">
                          <span class="text-lg">🔄</span>
                          <div>
                            <strong>useRealtimeRecord:</strong> Subscribes to updates for THIS todo only. 
                            Open this page in two tabs and toggle completion - watch it sync instantly!
                          </div>
                        </div>
                        <div class="flex items-start gap-2">
                          <span class="text-lg">⚡</span>
                          <div>
                            <strong>Optimistic Updates:</strong> Click the checkbox - it updates immediately 
                            before the server confirms. The UI feels instant and responsive!
                          </div>
                        </div>
                        <div class="flex items-start gap-2">
                          <span class="text-lg">🎨</span>
                          <div>
                            <strong>Type Safety:</strong> TypeScript automatically knows about todo.title and 
                            todo.completed. Try accessing a field that doesn't exist!
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Realtime Test Card */}
                  <Card>
                    <div class="p-6">
                      <h3 class="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                        🧪 Test Realtime Updates
                      </h3>
                      <ol class="list-decimal list-inside space-y-2 text-sm text-[var(--color-text-secondary)]">
                        <li>Open this same todo in another browser tab or window</li>
                        <li>Click the checkbox to toggle completion in one window</li>
                        <li>Watch it update in the other window in real-time!</li>
                        <li>Try editing the title and see it sync across windows</li>
                        <li>Check the browser console to see realtime events being logged</li>
                      </ol>
                      <div class="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded border border-[var(--color-border-primary)]">
                        <p class="text-xs text-[var(--color-text-tertiary)] font-mono">
                          Query Key: ["todos", "detail", "{data().id}"]
                        </p>
                        <p class="text-xs text-[var(--color-text-tertiary)] font-mono">
                          Subscription: todos/{data().id}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Code Example Card */}
                  <Card>
                    <div class="p-6">
                      <h3 class="text-lg font-bold text-[var(--color-text-primary)] mb-3">
                        💻 Code Example
                      </h3>
                      <pre class="bg-[var(--color-bg-secondary)] p-4 rounded border border-[var(--color-border-primary)] overflow-x-auto text-xs">
                        <code class="text-[var(--color-text-secondary)]">{`// Fetch single record
const todo = useRecord("todos", () => params().id)
// Returns: TodoRecord with full type safety!

// Subscribe to realtime updates for this record only
useRealtimeRecord("todos", () => params().id, (event) => {
  console.log("Event:", event.action, event.record)
})

// Update with optimistic updates
const updateTodo = useUpdateRecord("todos")
updateTodo.mutate({
  id: params().id,
  completed: !todo.data.completed
})
// UI updates instantly, rolls back on error!`}</code>
                      </pre>
                    </div>
                  </Card>
                </div>
              )}
            </Show>
          </Suspense>
        </PageContainer>
      </PageLayout>
    </>
  )
}
