import { createFileRoute, useNavigate, Link } from "@tanstack/solid-router"
import { createSignal, Show } from "solid-js"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/toast"
import { requireGuest } from "@/lib/route-guards"
import { PageLayout, PageContainer, InfoBox, AuthInput, Button } from "@/components/ui"

export const Route = createFileRoute("/_auth/signup")({
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
    <PageLayout variant="auth">
      <PageContainer size="sm" padding={false}>
        <div class="space-y-8">
          <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-[var(--color-text-primary)]">
              Create your account
            </h2>
            <p class="mt-2 text-center text-sm text-[var(--color-text-secondary)]">
              Or{" "}
              <Link to="/login" class="font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)]">
                sign in to your existing account
              </Link>
            </p>
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
                autocomplete="new-password"
                required
                placeholder="Password (min. 8 characters)"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                position="middle"
              />
              <AuthInput
                id="password-confirm"
                label="Confirm Password"
                type="password"
                name="password-confirm"
                autocomplete="new-password"
                required
                placeholder="Confirm password"
                value={passwordConfirm()}
                onInput={(e) => setPasswordConfirm(e.currentTarget.value)}
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
                {loading() ? "Creating account..." : "Sign up"}
              </Button>
            </div>
          </form>
        </div>
      </PageContainer>
    </PageLayout>
  )
}
