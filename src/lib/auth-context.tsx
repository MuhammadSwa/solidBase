/**
 * Simplified Auth Context
 * 
 * This is a thin wrapper that makes auth functions available via context.
 * The actual auth state is managed by signals in pocketbase.ts
 */

import { createContext, useContext } from 'solid-js'
import type { ParentComponent } from 'solid-js'
import * as pb from './pocketbase'

// Auth context provides direct access to auth functions and state
const auth = {
  // State (signals from pocketbase.ts)
  isAuthenticated: pb.isAuthenticated,
  user: pb.currentUser,
  isAdmin: pb.isAdmin,
  
  // Actions (functions from pocketbase.ts)
  login: pb.login,
  logout: pb.logout,
  register: pb.register,
  requestPasswordReset: pb.requestPasswordReset,
  loginWithOAuth2: pb.loginWithOAuth2,
  refreshAuth: pb.refreshAuth,
}

const AuthContext = createContext(auth)

/**
 * Auth Provider - Simple passthrough
 */
export const AuthProvider: ParentComponent = (props) => {
  return <AuthContext.Provider value={auth}>
    {props.children}
  </AuthContext.Provider>
}

/**
 * Hook to access auth (or use pb.* directly)
 */
export const useAuth = () => useContext(AuthContext)

