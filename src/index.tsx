/* @refresh reload */
import { render } from 'solid-js/web'
import { RouterProvider, createRouter } from '@tanstack/solid-router'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import { AuthProvider } from './lib/auth-context'
import { isAuthenticated, currentUser } from './lib/pocketbase'
// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './index.css'

// Define router context type
export interface RouterContext {
  auth: {
    isAuthenticated: () => boolean
    user: () => any
  }
}

// Create QueryClient for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Create a new router instance with auth context
const router = createRouter({ 
  routeTree,
  context: {
    auth: {
      isAuthenticated,
      user: currentUser,
    },
  },
})

// Register the router instance for type safety
declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  render(
    () => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    ),
    rootElement
  )
}
