import { createFileRoute, Link } from "@tanstack/solid-router"
import { For, Show, Suspense, createSignal } from "solid-js"
import { useCollection, useDeleteRecord, useUpdateRecord, useRealtimeCollection } from "@/lib/queries"
import { type TodoRecord } from "@/types/pocketbase-types"
import { useConfirmationDialog } from "@/lib/confirmation-dialog"


export const Route = createFileRoute("/_authenticated/todos/")({
  component: TodosPage,
})

function TodosPage() {
  const todos = useCollection<TodoRecord>("todos", { sort: "-created" })
  const deleteTodo = useDeleteRecord("todos")
  const updateTodo = useUpdateRecord<TodoRecord>("todos")
  const [deletingId, setDeletingId] = createSignal<string | null>(null)
  const confirmDialog = useConfirmationDialog()

  useRealtimeCollection("todos")

  const handleToggleComplete = (todo: TodoRecord) => {
    updateTodo.mutate({
      id: todo.id,
      completed: !todo.completed,
    })
  }

  const handleDelete = (id: string, title: string) => {
    confirmDialog.confirm({
      title: "Delete Todo",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: () => {
        setDeletingId(id)
        deleteTodo.mutate(id, {
          onSettled: () => setDeletingId(null),
        })
      },
    })
  }

  const stats = () => {
    const items = todos.data?.items || []
    return {
      total: items.length,
      completed: items.filter((t) => t.completed).length,
      active: items.filter((t) => !t.completed).length,
    }
  }

  return (
    <>
      <confirmDialog.ConfirmationDialog />
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div class="max-w-3xl mx-auto">
          <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">✅ Todo List</h1>
          <p class="text-gray-600">
            Powered by PocketBase + TanStack Query + SolidJS
          </p>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow p-4 text-center">
            <div class="text-2xl font-bold text-blue-600">{stats().total}</div>
            <div class="text-sm text-gray-600">Total</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4 text-center">
            <div class="text-2xl font-bold text-green-600">{stats().completed}</div>
            <div class="text-sm text-gray-600">Completed</div>
          </div>
          <div class="bg-white rounded-lg shadow p-4 text-center">
            <div class="text-2xl font-bold text-orange-600">{stats().active}</div>
            <div class="text-sm text-gray-600">Active</div>
          </div>
        </div>

        <div class="mb-6">
          <Link
            to="/todos/new"
            class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Todo
          </Link>
        </div>

        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <Suspense
            fallback={
              <div class="p-8 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p class="mt-2 text-gray-500">Loading todos...</p>
              </div>
            }
          >
            <Show
              when={!todos.isLoading && todos.data}
              fallback={
                <div class="p-8 text-center">
                  <Show when={todos.isError}>
                    <p class="text-red-600">Error: {todos.error?.message || "Failed to load todos"}</p>
                  </Show>
                </div>
              }
            >
              {(data) => (
                <For
                  each={data().items}
                  fallback={
                    <div class="p-12 text-center">
                      <div class="text-6xl mb-4">📝</div>
                      <p class="text-gray-500 text-lg mb-4">No todos yet!</p>
                      <Link to="/todos/new" class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Create your first todo
                      </Link>
                    </div>
                  }
                >
                  {(todo) => {
                    const isDeleting = () => deletingId() === todo.id
                    return (
                      <div
                        class="border-b last:border-b-0 transition-all duration-200"
                        classList={{ "opacity-50 bg-red-50 pointer-events-none": isDeleting() }}
                      >
                        <div class="p-4 flex items-center gap-4 hover:bg-gray-50">
                          <button
                            onClick={() => handleToggleComplete(todo)}
                            class="w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
                            classList={{
                              "border-green-500 bg-green-500": todo.completed,
                              "border-gray-300 hover:border-green-400": !todo.completed,
                            }}
                          >
                            <Show when={todo.completed}>
                              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </Show>
                          </button>

                          <div class="flex-1">
                            <p classList={{ "line-through text-gray-400": todo.completed, "text-gray-800": !todo.completed }}>
                              {todo.title}
                            </p>
                            <p class="text-xs text-gray-400 mt-1">{new Date(todo.created).toLocaleString()}</p>
                          </div>

                          <button
                            onClick={() => handleDelete(todo.id, todo.title)}
                            disabled={isDeleting()}
                            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Show
                              when={!isDeleting()}
                              fallback={
                                <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              }
                            >
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </Show>
                          </button>
                        </div>
                      </div>
                    )
                  }}
                </For>
              )}
            </Show>
          </Suspense>
        </div>

        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="text-sm font-medium text-blue-900 mb-2">⚡ Features Showcase</h3>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>✅ Optimistic updates - instant UI feedback</li>
            <li>🔄 Realtime sync - updates across all tabs</li>
            <li>🎯 Smart caching - no unnecessary refetches</li>
            <li>🛡️ Automatic rollback - errors handled gracefully</li>
          </ul>
        </div>
        </div>
      </div>
    </>
  )
}

