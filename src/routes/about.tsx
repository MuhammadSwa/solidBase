import { createFileRoute } from '@tanstack/solid-router'
import { PageLayout, PageContainer, Card } from '@/components/ui'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <PageLayout>
      <PageContainer size="lg">
        <h1 class="text-4xl font-bold text-[var(--color-text-primary)] mb-8 pt-12">
          About This Template
        </h1>

        <Card class="mb-8">
          <h2 class="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">What's Inside</h2>
          <p class="text-[var(--color-text-secondary)] mb-4">
            This template combines the best modern web technologies to give you a 
            head start on building production-ready applications:
          </p>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-[var(--color-text-primary)] mb-2">⚡ SolidJS</h3>
              <p class="text-[var(--color-text-secondary)]">
                A declarative, efficient, and flexible JavaScript library for building user interfaces.
                SolidJS uses fine-grained reactivity to update only what changes, making it incredibly fast.
              </p>
            </div>

            <div>
              <h3 class="text-lg font-medium text-[var(--color-text-primary)] mb-2">🗄️ PocketBase</h3>
              <p class="text-[var(--color-text-secondary)]">
                An open-source backend in a single file. PocketBase gives you a realtime database,
                built-in authentication, file storage, and an admin dashboard - all with zero configuration.
                <strong class="text-[var(--color-success)]"> This template includes full realtime sync functionality 
                - changes are automatically pushed to all connected clients!</strong>
              </p>
            </div>

            <div>
              <h3 class="text-lg font-medium text-[var(--color-text-primary)] mb-2">🛣️ TanStack Router</h3>
              <p class="text-[var(--color-text-secondary)]">
                Type-safe routing with automatic code splitting, data loading, and nested routes.
                The router integrates seamlessly with authentication using beforeLoad guards.
              </p>
            </div>

            <div>
              <h3 class="text-lg font-medium text-[var(--color-text-primary)] mb-2">📊 TanStack Query</h3>
              <p class="text-[var(--color-text-secondary)]">
                Powerful data synchronization for the web. Handles caching, background updates,
                and stale data management automatically.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 class="text-2xl font-semibold mb-4 text-[var(--color-text-primary)]">Key Features</h2>
          <ul class="space-y-3 text-[var(--color-text-secondary)]">
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span>Complete authentication system with login, logout, and protected routes</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span>Type-safe routing with automatic route generation</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span>Data fetching with caching and optimistic updates</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span>Reactive auth state using SolidJS signals</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span><strong>Realtime data sync</strong> - Live updates across all connected clients (try the Patients or Todos pages!)</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span><strong>Optimistic updates</strong> - Instant UI feedback with automatic error rollback</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span><strong>Dark mode support</strong> - Seamless light/dark/system theme switching with persistent preferences</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span><strong>CSS variables theming</strong> - OKLCH color system for consistent light and dark modes</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span><strong>Reusable UI components</strong> - Cards, buttons, forms, layouts, and more with consistent styling</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span><strong>Toast notifications</strong> - Beautiful, accessible notifications with success, error, info variants</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span><strong>Confirmation dialogs</strong> - Composable dialog system for destructive actions</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span><strong>Select components</strong> - Accessible dropdown menus with icon support</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span><strong>Clean architecture</strong> - Separated UI components (/components) and business logic (/lib)</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span>Tailwind CSS v4 for rapid UI development</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span>Hot module replacement for instant feedback</span>
            </li>
            <li class="flex items-start">
              <span class="text-[var(--color-success)] mr-2">✓</span>
              <span>Production-ready build configuration</span>
            </li>
          </ul>
        </Card>

        <div class="mt-8 p-6 bg-[var(--color-info-bg)] border border-[var(--color-info-border)] rounded-lg mb-8">
          <h3 class="text-lg font-medium text-[var(--color-info-text)] mb-2">Getting Started</h3>
          <p class="text-[var(--color-info-text)] mb-4">
            Check out the README.md file for detailed setup instructions and usage examples.
          </p>
          <div class="flex gap-4">
            <a 
              href="https://docs.solidjs.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-[var(--color-brand-primary)] hover:underline"
            >
              SolidJS Docs →
            </a>
            <a 
              href="https://pocketbase.io/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-[var(--color-brand-primary)] hover:underline"
            >
              PocketBase Docs →
            </a>
            <a 
              href="https://tanstack.com/router" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-[var(--color-brand-primary)] hover:underline"
            >
              TanStack Router Docs →
            </a>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  )
}
