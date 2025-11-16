/**
 * Composable Query Hooks for PocketBase + TanStack Query
 * 
 * These hooks provide a simple, reusable pattern for data fetching.
 * They handle loading states, errors, and caching automatically.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/solid-query'
import * as pb from './pocketbase'

// =============================================================================
// QUERY HOOKS - For fetching data
// =============================================================================

/**
 * Fetch paginated records from a collection
 * 
 * @example
 * const patients = useCollection('patients', { sort: '-created' })
 * <Show when={patients.data}>{data => ...}</Show>
 */
export function useCollection<T = any>(
  collection: string,
  options?: any,
  queryOptions?: { staleTime?: number; enabled?: boolean }
) {
  return useQuery(() => ({
    queryKey: [collection, 'list', options],
    queryFn: () => pb.getList<T>(collection, 1, 50, options),
    staleTime: queryOptions?.staleTime ?? 1000 * 60 * 5, // 5 min default
    enabled: queryOptions?.enabled ?? true,
  }))
}

/**
 * Fetch a single record by ID
 * 
 * @example
 * const patient = useRecord('patients', () => params.id)
 * <Show when={patient.data}>{data => ...}</Show>
 */
export function useRecord<T = any>(
  collection: string,
  id: () => string,
  options?: any
) {
  return useQuery(() => ({
    queryKey: [collection, 'detail', id()],
    queryFn: () => pb.getOne<T>(collection, id(), options),
    enabled: !!id(),
  }))
}

// =============================================================================
// MUTATION HOOKS - For creating/updating/deleting data
// =============================================================================

/**
 * Create a new record in a collection
 * 
 * @example
 * const createPatient = useCreateRecord('patients')
 * createPatient.mutate({ name: 'John Doe' })
 */
export function useCreateRecord<T = any>(collection: string) {
  const queryClient = useQueryClient()

  return useMutation(() => ({
    mutationFn: (data: any) => pb.create<T>(collection, data),
    onSuccess: () => {
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: [collection, 'list'] })
    },
  }))
}

/**
 * Update an existing record
 * 
 * @example
 * const updatePatient = useUpdateRecord('patients')
 * updatePatient.mutate({ id: '123', name: 'Jane Doe' })
 */
export function useUpdateRecord<T = any>(collection: string) {
  const queryClient = useQueryClient()

  return useMutation(() => ({
    mutationFn: ({ id, ...data }: { id: string;[key: string]: any }) =>
      pb.update<T>(collection, id, data),
    onSuccess: () => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({ queryKey: [collection] })
    },
  }))
}

/**
 * Delete a record
 * 
 * @example
 * const deletePatient = useDeleteRecord('patients')
 * deletePatient.mutate('record-id')
 */
export function useDeleteRecord(collection: string) {
  const queryClient = useQueryClient()

  return useMutation(() => ({
    mutationFn: (id: string) => pb.deleteRecord(collection, id),
    onSuccess: () => {
      // Invalidate list queries to refetch
      queryClient.invalidateQueries({ queryKey: [collection, 'list'] })
    },
  }))
}

// =============================================================================
// REALTIME INTEGRATION - Auto-sync PocketBase realtime with TanStack Query
// =============================================================================

import { onMount, onCleanup } from 'solid-js'

/**
 * Base record type with id field
 */
type RecordWithId = { id: string; [key: string]: any }

/**
 * Realtime event from PocketBase subscription
 */
interface RealtimeEvent<T extends RecordWithId = RecordWithId> {
  action: 'create' | 'update' | 'delete'
  record: T
}

/**
 * Subscribe to realtime updates for a collection with automatic query cache sync
 * 
 * This hook automatically:
 * - Subscribes to PocketBase realtime events on mount
 * - Updates TanStack Query cache based on realtime events
 * - Unsubscribes on cleanup
 * 
 * @example
 * // In your component
 * const patients = useCollection('patients')
 * useRealtimeCollection('patients')  // That's it! Auto-syncs with cache
 * 
 * @example
 * // With custom handler
 * useRealtimeCollection('patients', (event) => {
 *   console.log('Patient updated:', event.record)
 * })
 */
export function useRealtimeCollection<T extends RecordWithId = RecordWithId>(
  collection: string,
  onEvent?: (event: RealtimeEvent<T>) => void
) {
  const queryClient = useQueryClient()

  onMount(() => {
    // Subscribe to all records in the collection
    const unsubscribe = pb.pb.collection(collection).subscribe<T>('*', (e) => {
      // Cast to our typed event (PocketBase returns RecordSubscription which has action as string)
      const event = e as unknown as RealtimeEvent<T>
      
      // Call custom handler if provided
      onEvent?.(event)

      // Automatically sync cache based on action
      switch (event.action) {
        case 'create':
          // Invalidate list queries to show new record
          queryClient.invalidateQueries({ queryKey: [collection, 'list'] })
          break

        case 'update':
          // Update the specific record in cache
          queryClient.setQueryData(
            [collection, 'detail', event.record.id],
            event.record
          )
          // Also invalidate lists to update any filtered views
          queryClient.invalidateQueries({ queryKey: [collection, 'list'] })
          break

        case 'delete':
          // Remove from cache and invalidate lists
          queryClient.removeQueries({ queryKey: [collection, 'detail', event.record.id] })
          queryClient.invalidateQueries({ queryKey: [collection, 'list'] })
          break
      }
    })

    // Cleanup subscription on unmount
    onCleanup(() => {
      unsubscribe?.then((unsub) => unsub())
    })
  })
}

/**
 * Subscribe to realtime updates for a specific record with automatic query cache sync
 * 
 * This hook automatically:
 * - Subscribes to PocketBase realtime events for a specific record
 * - Updates TanStack Query cache when the record changes
 * - Unsubscribes on cleanup
 * 
 * @example
 * const patient = useRecord('patients', () => params.id)
 * useRealtimeRecord('patients', () => params.id)  // Auto-syncs this record
 */
export function useRealtimeRecord<T extends RecordWithId = RecordWithId>(
  collection: string,
  id: () => string,
  onEvent?: (event: RealtimeEvent<T>) => void
) {
  const queryClient = useQueryClient()

  onMount(() => {
    const recordId = id()
    if (!recordId) return

    // Subscribe to specific record
    const unsubscribe = pb.pb.collection(collection).subscribe<T>(recordId, (e) => {
      // Cast to our typed event (PocketBase returns RecordSubscription which has action as string)
      const event = e as unknown as RealtimeEvent<T>
      
      // Call custom handler if provided
      onEvent?.(event)

      // Automatically sync cache based on action
      switch (event.action) {
        case 'update':
          // Update the specific record in cache
          queryClient.setQueryData(
            [collection, 'detail', event.record.id],
            event.record
          )
          // Also invalidate lists that might contain this record
          queryClient.invalidateQueries({ queryKey: [collection, 'list'] })
          break

        case 'delete':
          // Remove from cache and invalidate lists
          queryClient.removeQueries({ queryKey: [collection, 'detail', event.record.id] })
          queryClient.invalidateQueries({ queryKey: [collection, 'list'] })
          break
      }
    })

    // Cleanup subscription on unmount
    onCleanup(() => {
      unsubscribe?.then((unsub) => unsub())
    })
  })
}

/**
 * Advanced: Subscribe with custom query key pattern
 * Use this when you need fine-grained control over cache invalidation
 * 
 * @example
 * const queryClient = useQueryClient()
 * useRealtimeSubscription<Patient>(
 *   () => pb.pb.collection('patients').subscribe('*', (e) => {
 *     const event = e as RealtimeEvent<Patient>
 *     // Custom cache update logic
 *     queryClient.invalidateQueries({ queryKey: ['patients', event.record.status] })
 *   })
 * )
 */
export function useRealtimeSubscription(
  subscribe: () => Promise<() => void>
) {
  onMount(() => {
    const unsubscribePromise = subscribe()
    
    onCleanup(() => {
      unsubscribePromise?.then((unsub) => unsub())
    })
  })
}
