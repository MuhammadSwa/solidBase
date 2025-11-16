import { createFileRoute, Link } from "@tanstack/solid-router"
import { useAuth } from "../lib/auth-context"
import { Show } from "solid-js"

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const auth = useAuth()

  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div class="max-w-4xl mx-auto px-4 py-16">
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold text-gray-900 mb-4">
            SolidJS + PocketBase + TanStack Router
          </h1>
          <p class="text-xl text-gray-600">
            A modern, production-ready template for building blazing-fast web applications
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-semibold mb-4">🚀 Features</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="flex items-start space-x-3">
              <div class="text-2xl">⚡</div>
              <div>
                <h3 class="font-medium">Fine-grained Reactivity</h3>
                <p class="text-sm text-gray-600">SolidJS for optimal performance</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🗄️</div>
              <div>
                <h3 class="font-medium">Backend in a File</h3>
                <p class="text-sm text-gray-600">PocketBase with auth & realtime DB</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🛣️</div>
              <div>
                <h3 class="font-medium">Type-safe Routing</h3>
                <p class="text-sm text-gray-600">TanStack Router with file-based routes</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🔐</div>
              <div>
                <h3 class="font-medium">Auth Built-in</h3>
                <p class="text-sm text-gray-600">Protected routes & redirects</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">📊</div>
              <div>
                <h3 class="font-medium">Smart Caching</h3>
                <p class="text-sm text-gray-600">TanStack Query integration</p>
              </div>
            </div>
            <div class="flex items-start space-x-3">
              <div class="text-2xl">🎨</div>
              <div>
                <h3 class="font-medium">Tailwind CSS v4</h3>
                <p class="text-sm text-gray-600">Modern utility-first styling</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-semibold mb-4">🎯 Quick Start</h2>
          
          <Show 
            when={auth.isAuthenticated()}
            fallback={
              <div class="space-y-4">
                <p class="text-gray-600">
                  To explore the full features including realtime sync, please sign in:
                </p>
                <Link 
                  to="/login" 
                  class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Sign In →
                </Link>
                <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p class="text-sm text-blue-800">
                    <strong>Demo Tip:</strong> After signing in, you'll be brought right back here. 
                    Then try the Patients page to see realtime sync in action!
                  </p>
                </div>
              </div>
            }
          >
            <div class="space-y-4">
              <p class="text-gray-600">
                Welcome back, <strong>{auth.user()?.email}</strong>!
              </p>
              <div class="flex gap-4">
                <Link 
                  to="/dashboard" 
                  class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Go to Dashboard →
                </Link>
                <Link 
                  to="/patients" 
                  class="inline-block px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  View Patients (Example) →
                </Link>
              </div>
            </div>
          </Show>
        </div>

        <div class="mt-8 text-center text-gray-600">
          <p class="mb-2">Check out the <Link to="/about" class="text-blue-600 hover:underline">About</Link> page to learn more</p>
          <p class="text-sm">
            Read the documentation in README.md for setup instructions
          </p>
        </div>
      </div>
    </div>
  )
}
