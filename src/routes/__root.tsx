import { createRootRouteWithContext, Link, Outlet, useNavigate, useLocation } from "@tanstack/solid-router"
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools"
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
import type { RouterContext } from "@/index"
import { Show } from "solid-js"
import { useAuth } from "@/lib/auth-context"
import { ToastContainer, toast } from "@/components/toast"
import { DarkModeToggle } from "@/components/dark-mode-toggle"

const RootLayout = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    auth.logout()
    toast.success('Signed out successfully')

    // OLD: If on a protected route (under _authenticated), redirect to home
    //
    const currentPath = location().pathname
    // List of public routes
    const publicRoutes = ['/', '/about', '/login']
    const isPublicRoute = publicRoutes.includes(currentPath)

    // If it's a protected route, redirect to home
    if (!isPublicRoute) {
      navigate({ to: '/' })
    }
  }

  return (
    <>
      <ToastContainer />
      <div class="p-2 flex gap-4 items-center border-b bg-[var(--color-bg-elevated)] border-[var(--color-border-primary)]">
        <Link to="/" class="[&.active]:font-bold text-[var(--color-text-primary)] hover:text-[var(--color-brand-primary)]">
          Home
        </Link>
        <Link to="/about" class="[&.active]:font-bold text-[var(--color-text-primary)] hover:text-[var(--color-brand-primary)]">
          About
        </Link>
        <Show when={auth.isAuthenticated()}>
          <Link to="/dashboard" class="[&.active]:font-bold text-[var(--color-text-primary)] hover:text-[var(--color-brand-primary)]">
            Dashboard
          </Link>
        </Show>

        <div class="ml-auto flex gap-2 items-center">
          <DarkModeToggle />
          <Show
            when={auth.isAuthenticated()}
            fallback={
              <>
                <Link to="/login" class="px-4 py-1 text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] font-medium">
                  Login
                </Link>
                <Link to="/signup" class="px-4 py-1 bg-[var(--color-brand-primary)] text-white rounded hover:bg-[var(--color-brand-primary-hover)]">
                  Sign up
                </Link>
              </>
            }
          >
            <span class="text-sm text-[var(--color-text-secondary)]">
              {auth.user()?.email}
              <Show when={auth.isAdmin()}>
                <span class="ml-2 px-2 py-0.5 text-xs font-semibold bg-[var(--gradient-secondary-from)] text-[var(--color-accent-purple)] rounded">
                  Admin
                </span>
              </Show>
            </span>
            <button
              onClick={handleLogout}
              class="px-4 py-1 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded hover:bg-[var(--color-border-secondary)]"
            >
              Logout
            </button>
          </Show>
        </div>
      </div>
      <Outlet />
      <TanStackRouterDevtools />
      <SolidQueryDevtools />
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout
})
