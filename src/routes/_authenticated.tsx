import { createFileRoute, Outlet, redirect } from "@tanstack/solid-router"

// This is a pathless layout route that wraps all authenticated routes
// The beforeLoad function checks if the user is authenticated
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    // If user is not authenticated, redirect to login
    if (!context.auth.isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: {
          // Store the current location so we can redirect back after login
          redirect: location.href,
        },
      })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <div class="min-h-screen bg-[var(--color-bg-secondary)]">
      <Outlet />
    </div>
  )
}
