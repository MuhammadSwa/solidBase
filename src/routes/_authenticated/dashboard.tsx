import { createFileRoute, Link } from "@tanstack/solid-router"
import { useAuth } from "@/lib/auth-context"
import { Show } from "solid-js"

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
            <Show when={auth.isAdmin()}>
              <span class="ml-2 px-2 py-1 text-sm bg-purple-100 text-purple-800 rounded">
                Admin
              </span>
            </Show>
          </h2>
          <p class="text-gray-600">
            This is a protected route. Only authenticated users can see this page.
          </p>
          
          <div class="mt-6 grid md:grid-cols-2 gap-4">
            <Link 
              to="/patients"
              class="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
            >
              <h3 class="font-semibold text-blue-900 mb-1">View Patients</h3>
              <p class="text-sm text-blue-700">See all patients with realtime sync</p>
            </Link>
            <Link 
              to="/patients/new"
              class="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
            >
              <h3 class="font-semibold text-green-900 mb-1">Add Patient</h3>
              <p class="text-sm text-green-700">Create a new patient record</p>
            </Link>
          </div>
          
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
