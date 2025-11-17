import { createFileRoute, Link } from "@tanstack/solid-router"
import { useAuth } from "@/lib/auth-context"
import { Show } from "solid-js"
import { PageLayout, PageContainer, Card } from "@/components/ui"

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const auth = useAuth()

  return (
    <PageLayout variant="gradient">
      <PageContainer size="lg">
        <div class="text-center mb-12 pt-16">
          <h1 class="text-5xl font-bold text-[var(--color-text-primary)] mb-4">
            SolidJS + PocketBase + TanStack Router
          </h1>
          <p class="text-xl text-[var(--color-text-secondary)]">
            A modern, production-ready template for building blazing-fast web applications
          </p>
        </div>

        <Card class="mb-8">
          <h2 class="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">🚀 Features</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="flex items-start space-x-3">
              <div class="text-2xl">⚡</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Fine-grained Reactivity</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">SolidJS for optimal performance</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🗄️</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Backend in a File</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">PocketBase with auth & realtime DB</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🔄</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Real-time Sync</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">Live updates across all connected clients</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🛣️</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Type-safe Routing</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">TanStack Router with file-based routes</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🔐</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Auth Built-in</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">Protected routes & redirects</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">📊</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Smart Caching</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">TanStack Query integration</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🎨</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Tailwind CSS v4</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">Modern utility-first styling with OKLCH colors</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🌗</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Dark Mode</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">Seamless theme switching with CSS variables</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🧩</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Component Library</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">Reusable UI components with consistent styling</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🔔</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Toast Notifications</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">Beautiful notifications with auto-dismiss</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">✅</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Confirmation Dialogs</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">User-friendly action confirmations</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">📐</div>
              <div>
                <h3 class="font-medium text-[var(--color-text-primary)]">Clean Architecture</h3>
                <p class="text-sm text-[var(--color-text-secondary)]">Separated UI components and business logic</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 class="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">🎯 Quick Start</h2>
          
          <Show 
            when={auth.isAuthenticated()}
            fallback={
              <div class="space-y-4">
                <p class="text-[var(--color-text-secondary)]">
                  To explore the full features including realtime sync, please sign in:
                </p>
                <Link 
                  to="/login" 
                  class="inline-block px-6 py-3 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition"
                >
                  Sign In →
                </Link>
                <div class="mt-4 p-4 bg-[var(--color-info-bg)] border border-[var(--color-info-border)] rounded">
                  <p class="text-sm text-[var(--color-info-text)]">
                    <strong>💡 Realtime Features:</strong> After signing in, explore the Patients 
                    and Todo pages to see realtime sync in action! Open them in multiple browser 
                    tabs and watch changes sync instantly across all tabs.
                  </p>
                </div>
              </div>
            }
          >
            <div class="space-y-4">
              <p class="text-[var(--color-text-secondary)]">
                Welcome back, <strong class="text-[var(--color-text-primary)]">{auth.user()?.email}</strong>!
              </p>
              <div class="flex gap-4">
                <Link 
                  to="/dashboard" 
                  class="inline-block px-6 py-3 bg-[var(--color-brand-primary)] text-white rounded-lg hover:bg-[var(--color-brand-primary-hover)] transition"
                >
                  Go to Dashboard →
                </Link>
                <Link 
                  to="/patients" 
                  class="inline-block px-6 py-3 bg-[var(--color-success)] text-white rounded-lg hover:bg-[var(--color-success-hover)] transition"
                >
                  View Patients →
                </Link>
                <Link 
                  to="/todos" 
                  class="inline-block px-6 py-3 bg-[var(--color-brand-secondary)] text-white rounded-lg hover:bg-[var(--color-brand-secondary-hover)] transition"
                >
                  View Todos →
                </Link>
              </div>
              <div class="mt-4 p-4 bg-[var(--color-success-bg)] border border-[var(--color-success-border)] rounded">
                <p class="text-sm text-[var(--color-success-text)]">
                  <strong>🔄 Try Realtime:</strong> Open the Patients or Todos page in multiple tabs 
                  and watch changes sync instantly with optimistic updates!
                </p>
              </div>
            </div>
          </Show>
        </Card>

        <div class="mt-8 text-center text-[var(--color-text-secondary)] pb-8">
          <p class="mb-2">Check out the <Link to="/about" class="text-[var(--color-brand-primary)] hover:underline">About</Link> page to learn more</p>
          <p class="text-sm">
            Read the documentation in README.md for setup instructions
          </p>
        </div>
      </PageContainer>
    </PageLayout>
  )
}
