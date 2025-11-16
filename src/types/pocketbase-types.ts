/**
 * PocketBase Collection Types
 * 
 * This file contains TypeScript interfaces for your PocketBase collections.
 * Update these types to match your actual collection schemas for better type safety.
 * 
 * You can generate types automatically using pocketbase-typegen:
 * https://github.com/patmood/pocketbase-typegen
 */

import type { RecordModel } from 'pocketbase'

/**
 * Base interface for all records
 */
export interface BaseRecord extends RecordModel {
  id: string
  created: string
  updated: string
}

/**
 * Users collection (auth collection)
 * Extend this interface with your custom user fields
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

/**
 * Example: Patients collection
 * Replace or remove this based on your actual collections
 */
export interface PatientsRecord extends BaseRecord {
  // Add your actual patient fields here
  // For example:
  name: string
  // age?: number
  // diagnosis?: string
}

/**
 * Add more collection interfaces as needed
 * 
 * Example:
 * export interface PostsRecord extends BaseRecord {
 *   title: string
 *   content: string
 *   author: string // relation to users
 *   published: boolean
 * }
 */

/**
 * Type helper for collection names
 * Add your collection names here for autocomplete
 */
export type CollectionName =
  | 'users'
  | 'patients'
  // Add more collection names here
  | string

/**
 * Type helper for getting typed records
 * Usage: getTypedRecord<PatientsRecord>('patients', id)
 */
export type TypedRecord<T extends BaseRecord> = T
