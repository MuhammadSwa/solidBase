import { createRootRouteWithContext, Link, Outlet, useNavigate, useLocation } from "@tanstack/solid-router"
import { TanStackRouterDevtools } from "@tanstack/solid-router-devtools"
import type { RouterContext } from "../index"
import { Show } from "solid-js"
import { useAuth } from "../lib/auth-context"
import { ToastContainer, toast } from "../lib/toast"

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
      <div class="p-2 flex gap-4 items-center border-b">
        <Link to="/" class="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/about" class="[&.active]:font-bold">
          About
        </Link>
        <Show when={auth.isAuthenticated()}>
          <Link to="/dashboard" class="[&.active]:font-bold">
            Dashboard
          </Link>
        </Show>

        <div class="ml-auto flex gap-2 items-center">
          <Show
            when={auth.isAuthenticated()}
            fallback={
              <>
                <Link to="/login" class="px-4 py-1 text-blue-600 hover:text-blue-800 font-medium">
                  Login
                </Link>
                <Link to="/signup" class="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Sign up
                </Link>
              </>
            }
          >
            <span class="text-sm text-gray-600">
              {auth.user()?.email}
              <Show when={auth.isAdmin()}>
                <span class="ml-2 px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                  Admin
                </span>
              </Show>
            </span>
            <button
              onClick={handleLogout}
              class="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Logout
            </button>
          </Show>
        </div>
      </div>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout
})
