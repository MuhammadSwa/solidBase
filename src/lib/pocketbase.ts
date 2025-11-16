import PocketBase from 'pocketbase'
import { createSignal } from 'solid-js'

// Initialize PocketBase client
export const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')

// Types for better type safety
export interface User {
  id: string
  email?: string
  username?: string
  name?: string
  avatar?: string
  [key: string]: any
}

// Reactive auth state - exposed directly for maximum flexibility
export const [isAuthenticated, setIsAuthenticated] = createSignal(pb.authStore.isValid)
export const [currentUser, setCurrentUser] = createSignal<User | null>(
  pb.authStore.record as User | null
)

/**
 * Check if the current authenticated user is an admin
 */
export function isAdmin(): boolean {
  if (!pb.authStore.isValid) return false
  const record = pb.authStore.record
  // Admins don't have a collectionName property (they're not in a collection)
  return record ? !('collectionName' in record) || record.collectionName === undefined : false
}

// Auto-sync auth state with PocketBase
pb.authStore.onChange((token, record) => {
  setIsAuthenticated(!!token && !!record)
  setCurrentUser(record as User | null)
})

// =============================================================================
// AUTH FUNCTIONS - Simple, direct, and composable
// =============================================================================

/**
 * Login with email and password
 * Automatically tries admin auth first, then falls back to regular user auth
 */
export async function login(email: string, password: string) {
  try {
    // Try admin authentication first
    const authData = await pb.collection('_superusers').authWithPassword(email, password)
    return authData.record as User
  } catch (adminError) {
    // If admin auth fails, try regular user authentication
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      return authData.record as User
    } catch (userError) {
      // Throw the user error (more likely to be the relevant one)
      throw userError
    }
  }
}

/**
 * Logout current user
 */
export function logout() {
  pb.authStore.clear()
}

/**
 * Register new user and auto-login
 */
export async function register(
  email: string, 
  password: string, 
  passwordConfirm: string, 
  additionalData?: Record<string, any>
) {
  await pb.collection('users').create({
    email,
    password,
    passwordConfirm,
    ...additionalData,
  })
  
  // Auto-login after registration
  return await login(email, password)
}

/**
 * Refresh auth token (call on app init)
 * Automatically detects and refreshes admin or user token
 */
export async function refreshAuth() {
  if (!pb.authStore.isValid) return false
  
  try {
    // Check if the current auth is for an admin (admins have a different structure)
    const record = pb.authStore.record
    if (record && 'avatar' in record && record.collectionName === undefined) {
      // This is likely an admin
      await pb.admins.authRefresh()
    } else {
      // This is a regular user
      await pb.collection('users').authRefresh()
    }
    return true
  } catch {
    pb.authStore.clear()
    return false
  }
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string) {
  await pb.collection('users').requestPasswordReset(email)
}

/**
 * OAuth2 authentication
 */
export async function loginWithOAuth2(provider: string) {
  const authData = await pb.collection('users').authWithOAuth2({ provider })
  return authData.record as User
}

// =============================================================================
// DATA FUNCTIONS - Simplified, throw errors for query integration
// =============================================================================

/**
 * Fetch paginated records from a collection
 */
export async function getList<T = any>(collection: string, page = 1, perPage = 50, options?: any) {
  return await pb.collection(collection).getList<T>(page, perPage, options)
}

/**
 * Fetch all records (auto-pagination)
 */
export async function getFullList<T = any>(collection: string, options?: any) {
  return await pb.collection(collection).getFullList<T>(options)
}

/**
 * Fetch a single record by ID
 */
export async function getOne<T = any>(collection: string, id: string, options?: any) {
  return await pb.collection(collection).getOne<T>(id, options)
}

/**
 * Fetch first record matching filter
 */
export async function getFirstListItem<T = any>(collection: string, filter: string, options?: any) {
  return await pb.collection(collection).getFirstListItem<T>(filter, options)
}

/**
 * Create a new record
 */
export async function create<T = any>(collection: string, data: any) {
  return await pb.collection(collection).create<T>(data)
}

/**
 * Update an existing record
 */
export async function update<T = any>(collection: string, id: string, data: any) {
  return await pb.collection(collection).update<T>(id, data)
}

/**
 * Delete a record
 */
export async function deleteRecord(collection: string, id: string) {
  await pb.collection(collection).delete(id)
}
