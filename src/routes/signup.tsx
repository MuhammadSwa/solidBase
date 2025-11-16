import { createFileRoute, useNavigate, Link } from "@tanstack/solid-router"
import { createSignal, Show } from "solid-js"
import { useAuth } from "../lib/auth-context"
import { toast } from "../lib/toast"
import { requireGuest } from "../lib/route-guards"

export const Route = createFileRoute("/signup")({
  beforeLoad: ({ context }) => requireGuest(context),
  component: SignupPage,
})

function SignupPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = createSignal("")
  const [password, setPassword] = createSignal("")
  const [passwordConfirm, setPasswordConfirm] = createSignal("")
  const [error, setError] = createSignal("")
  const [loading, setLoading] = createSignal(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (password() !== passwordConfirm()) {
      setError("Passwords do not match")
      toast.error("Passwords do not match")
      return
    }

    // Validate password length
    if (password().length < 8) {
      setError("Password must be at least 8 characters")
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      // Register the user
      await auth.register(email(), password(), passwordConfirm())
      
      toast.success("Account created! Signing you in...", 2000)
      
      // Auto-login after successful registration
      setTimeout(async () => {
        try {
          await auth.login(email(), password())
          toast.success("Welcome! 🎉")
          navigate({ to: "/dashboard" })
        } catch (loginErr: any) {
          // If auto-login fails, redirect to login page
          toast.info("Please sign in with your new account")
          navigate({ to: "/login" })
        }
      }, 500)
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create account"
      setError(errorMessage)
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
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
                autocomplete="new-password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password (min. 8 characters)"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
              />
            </div>
            <div>
              <label for="password-confirm" class="sr-only">
                Confirm Password
              </label>
              <input
                id="password-confirm"
                name="password-confirm"
                type="password"
                autocomplete="new-password"
                required
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm password"
                value={passwordConfirm()}
                onInput={(e) => setPasswordConfirm(e.currentTarget.value)}
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
              {loading() ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
