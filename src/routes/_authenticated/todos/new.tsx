import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { createSignal } from "solid-js"
import { useCreateRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import { PageLayout, PageContainer, PageHeader, Card, InfoBox, FormField, FormActions, Button } from "@/components/ui"

export const Route = createFileRoute('/_authenticated/todos/new')({
  component: AddTodoPage,
})

function AddTodoPage() {
  const navigate = useNavigate()
  const [title, setTitle] = createSignal("")

  const createTodo = useCreateRecord("todos")

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
    <PageLayout variant="gradient">
      <PageContainer size="sm" padding>
        <PageHeader
          title="➕ Add New Todo"
          subtitle="Create a new task with instant optimistic updates"
        />

        <Card>
          <form onSubmit={handleSubmit} class="space-y-6">
            <FormField
              id="title"
              label="Todo Title"
              type="text"
              required
              placeholder="What needs to be done?"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              helperText="Press Enter or click Add to create"
            />

            <FormActions>
              <Button
                type="submit"
                variant="primary"
                disabled={createTodo.isPending}
                class="flex-1 shadow-md"
              >
                Add Todo
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={createTodo.isPending}
              >
                Cancel
              </Button>
            </FormActions>
          </form>
        </Card>

        <div class="mt-6">
          <InfoBox variant="success" title="⚡ Optimistic Updates">
            <p>
              When you add a todo, you'll be redirected instantly and it will appear
              in the list immediately. The server sync happens in the background!
            </p>
          </InfoBox>
        </div>
      </PageContainer>
    </PageLayout>
  )
}
