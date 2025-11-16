import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-gray-900 mb-8">
          About This Template
        </h1>

        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-semibold mb-4">What's Inside</h2>
          <p class="text-gray-600 mb-4">
            This template combines the best modern web technologies to give you a 
            head start on building production-ready applications:
          </p>
          
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">⚡ SolidJS</h3>
              <p class="text-gray-600">
                A declarative, efficient, and flexible JavaScript library for building user interfaces.
                SolidJS uses fine-grained reactivity to update only what changes, making it incredibly fast.
              </p>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">🗄️ PocketBase</h3>
              <p class="text-gray-600">
                An open-source backend in a single file. PocketBase gives you a realtime database,
                built-in authentication, file storage, and an admin dashboard - all with zero configuration.
              </p>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">🛣️ TanStack Router</h3>
              <p class="text-gray-600">
                Type-safe routing with automatic code splitting, data loading, and nested routes.
                The router integrates seamlessly with authentication using beforeLoad guards.
              </p>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">📊 TanStack Query</h3>
              <p class="text-gray-600">
                Powerful data synchronization for the web. Handles caching, background updates,
                and stale data management automatically.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-semibold mb-4">Key Features</h2>
          <ul class="space-y-3 text-gray-600">
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Complete authentication system with login, logout, and protected routes</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Type-safe routing with automatic route generation</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Data fetching with caching and optimistic updates</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Reactive auth state using SolidJS signals</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Tailwind CSS v4 for rapid UI development</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Hot module replacement for instant feedback</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2">✓</span>
              <span>Production-ready build configuration</span>
            </li>
          </ul>
        </div>

        <div class="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="text-lg font-medium text-blue-900 mb-2">Getting Started</h3>
          <p class="text-blue-800 mb-4">
            Check out the README.md file for detailed setup instructions and usage examples.
          </p>
          <div class="flex gap-4">
            <a 
              href="https://docs.solidjs.com" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              SolidJS Docs →
            </a>
            <a 
              href="https://pocketbase.io/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              PocketBase Docs →
            </a>
            <a 
              href="https://tanstack.com/router" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline"
            >
              TanStack Router Docs →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
