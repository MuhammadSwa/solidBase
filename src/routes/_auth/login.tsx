import { createFileRoute, useNavigate, Link } from "@tanstack/solid-router"
import { createSignal, Show } from "solid-js"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/lib/toast"
import { requireGuest } from "@/lib/route-guards"

export const Route = createFileRoute("/_auth/login")({
  beforeLoad: ({ context }) => requireGuest(context),
  component: LoginPage,
})

function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = createSignal("")
  const [password, setPassword] = createSignal("")
  const [error, setError] = createSignal("")
  const [loading, setLoading] = createSignal(false)

  // Get redirect URL from search params
  const search = Route.useSearch() as { redirect?: string }

  // Parse the redirect to show a friendly message
  const getRedirectMessage = () => {
    if (!search.redirect) return null

    const url = search.redirect
    if (url.includes('/patients')) return 'Patients page'
    if (url.includes('/dashboard')) return 'Dashboard'

    // Extract the path from the URL
    try {
      const path = new URL(url, window.location.origin).pathname
      return path.split('/').filter(Boolean).join(' / ') || 'the page you were viewing'
    } catch {
      return 'the page you were viewing'
    }
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await auth.login(email(), password())

      // Check if user is admin and show appropriate message
      const userType = auth.isAdmin() ? "Admin" : "User"
      
      // Show success message
      const redirectMessage = getRedirectMessage()
      if (redirectMessage) {
        toast.success(`Welcome back, ${userType}! Redirecting to ${redirectMessage}...`, 2000)
      } else {
        toast.success(`Welcome back${auth.isAdmin() ? ', Admin' : ''}!`, 2000)
      }

      // Small delay for toast to show, then redirect
      setTimeout(() => {
        const redirectTo = search.redirect || "/dashboard"
        navigate({ to: redirectTo as any })
      }, 500)
    } catch (err: any) {
      setError(err?.message || "Invalid email or password")
      toast.error('Sign in failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/signup" class="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
          <div class="mt-3 p-2 bg-gray-50 border border-gray-200 rounded">
            <p class="text-xs text-gray-600 text-center">
              Works for both regular users and admins
            </p>
          </div>
          <Show when={search.redirect}>
            <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-sm text-blue-800 text-center">
                <span class="font-medium">You'll be redirected to:</span>
                <br />
                <span class="font-semibold">{getRedirectMessage()}</span>
              </p>
            </div>
          </Show>
        </div>
        <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email" class="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
              />
            </div>
            <div>
              <label for="password" class="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
              />
            </div>
          </div>

          <Show when={error()}>
            <div class="rounded-md bg-red-50 p-4">
              <p class="text-sm text-red-800">{error()}</p>
            </div>
          </Show>

          <div>
            <button
              type="submit"
              disabled={loading()}
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading() ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
