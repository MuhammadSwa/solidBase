import { createFileRoute } from "@tanstack/solid-router"
import { useAuth } from "../../lib/auth-context"

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  const auth = useAuth()
  
  return (
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Dashboard
        </h1>
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-2">
            Welcome, {auth.user()?.email}!
          </h2>
          <p class="text-gray-600">
            This is a protected route. Only authenticated users can see this page.
          </p>
          
          <div class="mt-6">
            <h3 class="text-lg font-medium mb-2">User Information:</h3>
            <pre class="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(auth.user(), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
