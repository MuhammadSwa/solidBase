import { createFileRoute, Link } from "@tanstack/solid-router"
import { useAuth } from "@/lib/auth-context"
import { Show } from "solid-js"
import { PageLayout, PageContainer, PageHeader, Card } from "@/components/ui"

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  const auth = useAuth()
  
  return (
    <PageLayout>
      <PageContainer>
        <PageHeader title="Dashboard" />

        <Card>
          <h2 class="text-xl font-semibold mb-2 text-[var(--color-text-primary)]">
            Welcome, {auth.user()?.email}!
            <Show when={auth.isAdmin()}>
              <span class="ml-2 px-2 py-1 text-sm bg-[var(--gradient-secondary-from)] text-[var(--color-accent-purple)] rounded">
                Admin
              </span>
            </Show>
          </h2>
          <p class="text-[var(--color-text-secondary)]">
            This is a protected route. Only authenticated users can see this page.
          </p>
          
          <div class="mt-6 grid md:grid-cols-2 gap-4">
            <Link 
              to="/patients"
              class="block p-4 bg-[var(--color-info-bg)] border border-[var(--color-info-border)] rounded-lg hover:bg-[var(--color-border-primary)] transition"
            >
              <h3 class="font-semibold text-[var(--color-info-text)] mb-1">📋 View Patients</h3>
              <p class="text-sm text-[var(--color-info-text)]">Manage patient records with realtime sync</p>
            </Link>
            <Link 
              to="/patients/new"
              class="block p-4 bg-[var(--color-success-bg)] border border-[var(--color-success-border)] rounded-lg hover:bg-[var(--color-border-primary)] transition"
            >
              <h3 class="font-semibold text-[var(--color-success-text)] mb-1">➕ Add Patient</h3>
              <p class="text-sm text-[var(--color-success-text)]">Create a new patient record</p>
            </Link>
            <Link 
              to="/todos"
              class="block p-4 bg-[var(--gradient-secondary-from)] border border-[var(--color-accent-purple)] rounded-lg hover:bg-[var(--color-border-primary)] transition"
            >
              <h3 class="font-semibold text-[var(--color-accent-purple)] mb-1">✅ View Todos</h3>
              <p class="text-sm text-[var(--color-accent-purple)]">Manage tasks with optimistic updates</p>
            </Link>
            <Link 
              to="/todos/new"
              class="block p-4 bg-[var(--gradient-secondary-from)] border border-[var(--color-brand-secondary)] rounded-lg hover:bg-[var(--color-border-primary)] transition"
            >
              <h3 class="font-semibold text-[var(--color-brand-secondary)] mb-1">📝 Add Todo</h3>
              <p class="text-sm text-[var(--color-brand-secondary)]">Create a new todo item</p>
            </Link>
          </div>
          
          <div class="mt-6">
            <h3 class="text-lg font-medium mb-2 text-[var(--color-text-primary)]">User Information:</h3>
            <pre class="bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] p-4 rounded overflow-auto border border-[var(--color-border-primary)]">
              {JSON.stringify(auth.user(), null, 2)}
            </pre>
          </div>
        </Card>
      </PageContainer>
    </PageLayout>
  )
}
