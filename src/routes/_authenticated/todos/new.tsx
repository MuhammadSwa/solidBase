import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { createSignal } from "solid-js"
import { useCreateRecord } from "@/lib/queries"
import { toast } from "@/lib/toast"

type TodoRecord = {
  id: string
  title: string
  completed: boolean
  created: string
  updated: string
}

export const Route = createFileRoute('/_authenticated/todos/new')({
  component: AddTodoPage,
})

function AddTodoPage() {
  const navigate = useNavigate()
  const [title, setTitle] = createSignal("")

  const createTodo = useCreateRecord<TodoRecord>("todos")

  const handleSubmit = (e: Event) => {
    e.preventDefault()

    if (!title().trim()) {
      toast.error("Please enter a todo title")
      return
    }

    const todoTitle = title().trim()

    createTodo.mutate(
      { title: todoTitle, completed: false },
      {
        onSuccess: () => {
          toast.success("Todo added! 🎉")
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to add todo")
        },
      }
    )

    navigate({ to: "/todos" })
  }

  const handleCancel = () => {
    navigate({ to: "/todos" })
  }

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-800">➕ Add New Todo</h1>
          <p class="mt-2 text-gray-600">
            Create a new task with instant optimistic updates
          </p>
        </div>

        <div class="bg-white shadow-lg rounded-lg p-6">
          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
                Todo Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                autofocus
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="What needs to be done?"
                value={title()}
                onInput={(e) => setTitle(e.currentTarget.value)}
              />
              <p class="mt-2 text-sm text-gray-500">
                Press Enter or click Add to create
              </p>
            </div>

            <div class="flex gap-4">
              <button
                type="submit"
                disabled={createTodo.isPending}
                class="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition shadow-md"
              >
                Add Todo
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={createTodo.isPending}
                class="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 class="text-sm font-medium text-green-900 mb-2">⚡ Optimistic Updates</h3>
          <p class="text-sm text-green-800">
            When you add a todo, you'll be redirected instantly and it will appear
            in the list immediately. The server sync happens in the background!
          </p>
        </div>
      </div>
    </div>
  )
}
