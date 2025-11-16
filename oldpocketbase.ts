import PocketBase from 'pocketbase'
import { createSignal } from 'solid-js'

// Initialize PocketBase client
// Replace with your PocketBase URL (default: http://127.0.0.1:8090)
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

// Reactive auth state using SolidJS signals
export const [isAuthenticated, setIsAuthenticated] = createSignal(pb.authStore.isValid)
export const [currentUser, setCurrentUser] = createSignal<User | null>(
  pb.authStore.record as User | null
)

// Listen to auth state changes
pb.authStore.onChange((token, record) => {
  setIsAuthenticated(!!token && !!record)
  setCurrentUser(record as User | null)
})

// Auth helpers
export const authHelpers = {
  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      return { success: true, user: authData.record as User }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error }
    }
  },

  /**
   * Logout current user
   */
  logout() {
    pb.authStore.clear()
  },

  /**
   * Register new user
   */
  async register(email: string, password: string, passwordConfirm: string, additionalData?: Record<string, any>) {
    try {
      const data = {
        email,
        password,
        passwordConfirm,
        ...additionalData,
      }
      const record = await pb.collection('users').create(data)

      // Optionally auto-login after registration
      await this.login(email, password)

      return { success: true, user: record as User }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error }
    }
  },

  /**
   * Refresh auth token
   */
  async refreshAuth() {
    try {
      if (pb.authStore.isValid) {
        await pb.collection('users').authRefresh()
        return true
      }
      return false
    } catch (error) {
      console.error('Auth refresh error:', error)
      pb.authStore.clear()
      return false
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { success: true }
    } catch (error) {
      console.error('Password reset request error:', error)
      return { success: false, error }
    }
  },

  /**
   * OAuth2 authentication
   */
  async loginWithOAuth2(provider: string) {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider })
      return { success: true, user: authData.record as User }
    } catch (error) {
      console.error('OAuth2 login error:', error)
      return { success: false, error }
    }
  },
}

// Data fetching helpers with error handling
export const dataHelpers = {
  /**
   * Fetch records from a collection with type safety
   */
  async getList<T = any>(collection: string, options?: any) {
    try {
      const records = await pb.collection(collection).getList<T>(1, 50, options)
      return { success: true, data: records }
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error)
      return { success: false, error }
    }
  },

  /**
   * Fetch a single record by ID
   */
  async getOne<T = any>(collection: string, id: string, options?: any) {
    try {
      const record = await pb.collection(collection).getOne<T>(id, options)
      return { success: true, data: record }
    } catch (error) {
      console.error(`Error fetching ${collection}/${id}:`, error)
      return { success: false, error }
    }
  },

  /**
   * Create a new record
   */
  async create<T = any>(collection: string, data: any) {
    try {
      const record = await pb.collection(collection).create<T>(data)
      return { success: true, data: record }
    } catch (error) {
      console.error(`Error creating ${collection}:`, error)
      return { success: false, error }
    }
  },

  /**
   * Update a record
   */
  async update<T = any>(collection: string, id: string, data: any) {
    try {
      const record = await pb.collection(collection).update<T>(id, data)
      return { success: true, data: record }
    } catch (error) {
      console.error(`Error updating ${collection}/${id}:`, error)
      return { success: false, error }
    }
  },

  /**
   * Delete a record
   */
  async delete(collection: string, id: string) {
    try {
      await pb.collection(collection).delete(id)
      return { success: true }
    } catch (error) {
      console.error(`Error deleting ${collection}/${id}:`, error)
      return { success: false, error }
    }
  },
}
