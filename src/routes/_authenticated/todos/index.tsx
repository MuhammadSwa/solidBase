import { createFileRoute, Link } from "@tanstack/solid-router"
import { For, Show, Suspense, createSignal } from "solid-js"
import { useCollection, useDeleteRecord, useUpdateRecord, useRealtimeCollection } from "@/lib/queries"
import { type TodoRecord } from "@/types/pocketbase-types"
import { useConfirmationDialog } from "@/components/confirmation-dialog"
import { PageLayout, PageContainer, InfoBox, StatsCard } from "@/components/ui"


export const Route = createFileRoute("/_authenticated/todos/")({
  component: TodosPage,
})

function TodosPage() {
  const todos = useCollection("todos", { sort: "-created" })

  const deleteTodo = useDeleteRecord("todos")
  const updateTodo = useUpdateRecord("todos")
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
      <PageLayout variant="gradient">
        <PageContainer size="lg">
          <div class="text-center mb-8 pt-8">
            <h1 class="text-4xl font-bold text-[var(--color-text-primary)] mb-2">✅ Todo List</h1>
            <p class="text-[var(--color-text-secondary)]">
              Powered by PocketBase + TanStack Query + SolidJS
            </p>
          </div>

          <div class="grid grid-cols-3 gap-4 mb-6">
            <StatsCard value={stats().total} label="Total" color="blue" />
            <StatsCard value={stats().completed} label="Completed" color="green" />
            <StatsCard value={stats().active} label="Active" color="orange" />
          </div>

          <div class="mb-6">
            <Link
              to="/todos/new"
              class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-brand-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition shadow-md"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Todo
            </Link>
          </div>

          <div class="bg-[var(--color-bg-elevated)] rounded-lg shadow-lg overflow-hidden border border-[var(--color-border-primary)]">
            <Suspense
              fallback={
                <div class="p-8 text-center">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-brand-primary)]"></div>
                  <p class="mt-2 text-[var(--color-text-tertiary)]">Loading todos...</p>
                </div>
              }
            >
              <Show
                when={!todos.isLoading && todos.data}
                fallback={
                  <div class="p-8 text-center">
                    <Show when={todos.isError}>
                      <p class="text-[var(--color-error)]">Error: {todos.error?.message || "Failed to load todos"}</p>
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
                        <p class="text-[var(--color-text-tertiary)] text-lg mb-4">No todos yet!</p>
                        <Link to="/todos/new" class="inline-block px-6 py-2 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-primary-hover)]">
                          Create your first todo
                        </Link>
                      </div>
                    }
                  >
                    {(todo) => {
                      const isDeleting = () => deletingId() === todo.id
                      return (
                        <div
                          class="border-b border-[var(--color-border-primary)] last:border-b-0 transition-all duration-200"
                          classList={{ "opacity-50 bg-[var(--color-error-bg)] pointer-events-none": isDeleting() }}
                        >
                          <div class="p-4 flex items-center gap-4 hover:bg-[var(--color-bg-tertiary)]">
                            <button
                              onClick={() => handleToggleComplete(todo)}
                              class="w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
                              classList={{
                                "border-[var(--color-success)] bg-[var(--color-success)]": todo.completed,
                                "border-[var(--color-border-secondary)] hover:border-[var(--color-success)]": !todo.completed,
                              }}
                            >
                              <Show when={todo.completed}>
                                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                                </svg>
                              </Show>
                            </button>

                            <div class="flex-1">
                              <Link 
                                to="/todos/$id" 
                                params={{ id: todo.id }}
                                class="block hover:underline"
                              >
                                <p classList={{ "line-through text-[var(--color-text-tertiary)]": todo.completed, "text-[var(--color-text-primary)] font-medium": !todo.completed }}>
                                  {todo.title}
                                </p>
                              </Link>
                              <p class="text-xs text-[var(--color-text-tertiary)] mt-1">{new Date(todo.created).toLocaleString()}</p>
                            </div>

                            <Link 
                              to="/todos/$id" 
                              params={{ id: todo.id }}
                              class="p-2 text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-bg)] rounded-lg transition-colors"
                            >
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>

                            <button
                              onClick={() => handleDelete(todo.id, todo.title)}
                              disabled={isDeleting()}
                              class="p-2 text-[var(--color-error)] hover:bg-[var(--color-error-bg)] rounded-lg transition-colors"
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

          <InfoBox variant="info" class="mt-6">
            <h3 class="text-sm font-medium text-[var(--color-info-text)] mb-2">⚡ Features Showcase</h3>
            <ul class="text-sm text-[var(--color-info-text)] space-y-1">
              <li>✅ Optimistic updates - instant UI feedback</li>
              <li>🔄 Realtime sync - updates across all tabs</li>
              <li>🎯 Smart caching - no unnecessary refetches</li>
              <li>🛡️ Automatic rollback - errors handled gracefully</li>
            </ul>
          </InfoBox>
        </PageContainer>
      </PageLayout>
    </>
  )
}

