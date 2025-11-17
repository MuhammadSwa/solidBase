/**
 * PocketBase Collection Types
 * 
 * This file contains TypeScript interfaces for your PocketBase collections.
 * Update these types to match your actual collection schemas for better type safety.
 * 
 * 🎯 HOW IT WORKS:
 * ================
 * 
 * 1. Define your record types (what fields each collection has)
 * 2. Add them to the CollectionRecords interface (the mapping)
 * 3. All query hooks automatically infer the correct types!
 * 
 * EXAMPLE:
 * --------
 * // 1. Define the record type
 * export interface PostsRecord extends BaseRecord {
 *   title: string
 *   content: string
 * }
 * 
 * // 2. Add to CollectionRecords
 * export interface CollectionRecords {
 *   posts: PostsRecord  // ← Add this line
 * }
 * 
 * // 3. Use anywhere with automatic types!
 * const posts = useCollection("posts")  // ← Automatically typed as PostsRecord[]
 * 
 * You can generate types automatically using pocketbase-typegen:
 * https://github.com/patmood/pocketbase-typegen
 */

import type { RecordModel } from 'pocketbase'

/**
 * Base interface for all records
 * 
 * Every PocketBase record has these fields by default.
 * All your custom record types should extend this.
 */
export interface BaseRecord extends RecordModel {
  id: string        // Unique identifier
  created: string   // ISO timestamp when created
  updated: string   // ISO timestamp when last updated
}

/**
 * Users collection (auth collection)
 * 
 * This is the built-in PocketBase users/auth collection.
 * Extend this interface with your custom user fields.
 * 
 * @example
 * export interface UsersRecord extends BaseRecord {
 *   email?: string
 *   username?: string
 *   verified?: boolean
 *   // Add your custom fields:
 *   displayName?: string
 *   bio?: string
 *   avatarUrl?: string
 * }
 */
export interface UsersRecord extends BaseRecord {
  email?: string
  username?: string
  verified?: boolean
  emailVisibility?: boolean
  name?: string
  avatar?: string
  // Add your custom fields here
}

// =============================================================================
// 📊 APPLICATION COLLECTIONS - Add your collections here
// =============================================================================

/**
 * Patients collection
 * 
 * Example collection - replace with your actual schema.
 * Each field should match what's in your PocketBase collection.
 */
export interface PatientsRecord extends BaseRecord {
  name: string
  // Add your actual patient fields here:
  // age?: number
  // diagnosis?: string
  // doctorId?: string  // relation to users
}

/**
 * Todos collection
 * 
 * Simple todo list example.
 */
export interface TodoRecord extends BaseRecord {
  title: string       // Todo description
  completed: boolean  // Is it done?
}

/**
 * 📋 Add more collection interfaces here
 * 
 * Template:
 * export interface YourCollectionRecord extends BaseRecord {
 *   // your fields
 * }
 * 
 * Then add to the table below!
 */

// =============================================================================
// 🎯 COLLECTION TABLES - Organize your collections into logical groups
// =============================================================================

/**
 * Auth-related collections
 */
interface AuthCollections {
  users: UsersRecord
}

/**
 * Application collections
 * 
 * Add your application-specific collections here.
 * Keep this organized and easy to scan!
 */
interface AppCollections {
  patients: PatientsRecord
  todos: TodoRecord
  // Add your collections here:
  // posts: PostsRecord
  // comments: CommentsRecord
  // categories: CategoriesRecord
}

/**
 * 🎯 COLLECTION TYPE MAPPING
 * ==========================
 * 
 * This is THE MOST IMPORTANT part for automatic type inference!
 * 
 * This interface combines ALL your collection tables using TypeScript's
 * spread operator (&). This keeps things organized while maintaining
 * a single source of truth for type inference.
 * 
 * ⚠️  WORKFLOW: When adding a new collection
 * -------------------------------------------
 * 1. Define your record type above (e.g., PostsRecord)
 * 2. Add it to the appropriate collection table (e.g., AppCollections)
 * 3. That's it! It's automatically included here via spreading
 * 
 * 📊 ORGANIZATION:
 * ----------------
 * Collections are organized into logical tables:
 * - AuthCollections: users and auth-related collections
 * - AppCollections: your application-specific collections
 * - Add more tables as needed for organization
 * 
 * ❓ Why use tables?
 * ------------------
 * - Better organization (group related collections)
 * - Easier to scan and find collections
 * - Still get all the automatic type inference benefits
 * - No duplication - define once, spread here
 * 
 * 💡 TIP: If you forget to add a collection to a table, TypeScript will
 * remind you when you try to access custom fields (they won't exist on BaseRecord).
 * 
 * HOW IT WORKS:
 * -------------
 * When you write:
 *   const todos = useCollection("todos")
 * 
 * TypeScript:
 * 1. Sees you passed the string "todos"
 * 2. Looks up "todos" in this CollectionRecords interface
 * 3. Finds it via AppCollections (spread with &)
 * 4. Returns TodoRecord
 * 5. You get full autocomplete for todo.title, todo.completed, etc.!
 * 
 * @example Adding a new collection
 * // 1. Define your type above
 * export interface PostsRecord extends BaseRecord {
 *   title: string
 *   content: string
 * }
 * 
 * // 2. Add to AppCollections table
 * interface AppCollections {
 *   patients: PatientsRecord
 *   todos: TodoRecord
 *   posts: PostsRecord  // ← Add this line!
 * }
 * 
 * // 3. Now it works everywhere automatically:
 * const posts = useCollection("posts")  // Typed as PostsRecord[]! ✨
 * const createPost = useCreateRecord("posts")  // Knows PostsRecord fields! ✨
 */
export interface CollectionRecords extends AuthCollections, AppCollections {
  // All collections from AuthCollections and AppCollections are included here
  // via TypeScript's intersection (&) - no need to list them again!
  // 
  // Add one-off collections here if they don't fit in a table:
  // oneOffCollection: OneOffRecord
}
