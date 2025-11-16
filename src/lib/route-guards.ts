import { redirect } from "@tanstack/solid-router"
import type { RouterContext } from "@/index"

/**
 * Route guard for pages that require the user to be logged OUT
 * (e.g., login, signup)
 * 
 * If user is authenticated, redirects to dashboard
 */
export const requireGuest = (context: RouterContext) => {
  if (context.auth.isAuthenticated()) {
    throw redirect({
      to: "/dashboard",
    })
  }
}
