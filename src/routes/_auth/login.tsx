import { createFileRoute, useNavigate, Link } from "@tanstack/solid-router"
import { createSignal, Show } from "solid-js"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/toast"
import { requireGuest } from "@/lib/route-guards"
import { PageLayout, PageContainer, Card, InfoBox, AuthInput, Button } from "@/components/ui"

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
    <PageLayout variant="auth">
      <PageContainer size="sm" padding={false}>
        <div class="space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-[var(--color-text-primary)]">
              Sign in to your account
            </h2>
            <p class="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
              Or{" "}
              <Link to="/signup" class="font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)]">
                create a new account
              </Link>
            </p>
            
            <Card padding="sm" class="mt-3">
              <p class="text-xs text-[var(--color-text-secondary)] text-center">
                Works for both regular users and admins
              </p>
            </Card>

            <Show when={search.redirect}>
              <div class="mt-4">
                <InfoBox variant="info">
                  <p class="text-center">
                    <span class="font-medium">You'll be redirected to:</span>
                    <br />
                    <span class="font-semibold">{getRedirectMessage()}</span>
                  </p>
                </InfoBox>
              </div>
            </Show>
          </div>

          <form class="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div class="rounded-md shadow-sm -space-y-px">
              <AuthInput
                id="email"
                label="Email address"
                type="email"
                name="email"
                autocomplete="email"
                required
                placeholder="Email address"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                position="top"
              />
              <AuthInput
                id="password"
                label="Password"
                type="password"
                name="password"
                autocomplete="current-password"
                required
                placeholder="Password"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                position="bottom"
              />
            </div>

            <Show when={error()}>
              <InfoBox variant="error">
                <p>{error()}</p>
              </InfoBox>
            </Show>

            <div>
              <Button
                type="submit"
                variant="primary"
                disabled={loading()}
                class="w-full"
              >
                {loading() ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </div>
      </PageContainer>
    </PageLayout>
  )
}
