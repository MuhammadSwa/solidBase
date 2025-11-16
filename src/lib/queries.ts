/**
 * Composable Query Hooks for PocketBase + TanStack Query
 * 
 * These hooks provide a simple, reusable pattern for data fetching with:
 * - Automatic loading states, errors, and caching
 * - Optimistic updates for instant UI feedback
 * - Automatic rollback on errors
 * - Server sync on completion
 * 
 * OPTIMISTIC UPDATES:
 * All mutations (create, update, delete) use optimistic updates:
 * 1. UI updates immediately (no waiting for server)
 * 2. If server fails, changes are automatically rolled back
 * 3. On success, data is synced with server response
 * 
 * This eliminates flickering and provides a snappy, responsive UX.
 */

import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/solid-query'
import * as pb from './pocketbase'

// =============================================================================
// OPTIMISTIC UPDATE UTILITIES - Reusable optimistic update logic
// =============================================================================

type RecordWithId = { id: string; [key: string]: any }

/**
 * Optimistic create - adds new record to cache immediately
 */
async function optimisticCreate<T extends RecordWithId>(
  queryClient: QueryClient,
  collection: string,
  newRecord: Partial<T>
) {
  await queryClient.cancelQueries({ queryKey: [collection, 'list'] })
  
  const previousData = queryClient.getQueriesData({ queryKey: [collection, 'list'] })
  
  // Optimistically add to all list queries
  queryClient.setQueriesData({ queryKey: [collection, 'list'] }, (old: any) => {
    if (!old?.items) return old
    
    // Create temporary record with optimistic ID
    const tempRecord = {
      id: `temp-${Date.now()}`,
      ...newRecord,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    } as unknown as T
    
    return {
      ...old,
      items: [tempRecord, ...old.items],
      totalItems: old.totalItems + 1,
    }
  })
  
  return { previousData }
}

/**
 * Optimistic update - updates existing record in cache immediately
 */
async function optimisticUpdate<T extends RecordWithId>(
  queryClient: QueryClient,
  collection: string,
  id: string,
  updates: Partial<T>
) {
  await queryClient.cancelQueries({ queryKey: [collection] })
  
  const previousListData = queryClient.getQueriesData({ queryKey: [collection, 'list'] })
  const previousDetailData = queryClient.getQueryData([collection, 'detail', id])
  
  // Update in all list queries
  queryClient.setQueriesData({ queryKey: [collection, 'list'] }, (old: any) => {
    if (!old?.items) return old
    return {
      ...old,
      items: old.items.map((item: T) =>
        item.id === id ? { ...item, ...updates, updated: new Date().toISOString() } : item
      ),
    }
  })
  
  // Update detail query if it exists
  if (previousDetailData) {
    queryClient.setQueryData([collection, 'detail', id], (old: any) => ({
      ...old,
      ...updates,
      updated: new Date().toISOString(),
    }))
  }
  
  return { previousListData, previousDetailData }
}

/**
 * Optimistic delete - removes record from cache immediately
 */
async function optimisticDelete(
  queryClient: QueryClient,
  collection: string,
  id: string
) {
  await queryClient.cancelQueries({ queryKey: [collection, 'list'] })
  
  const previousData = queryClient.getQueriesData({ queryKey: [collection, 'list'] })
  
  // Remove from all list queries
  queryClient.setQueriesData({ queryKey: [collection, 'list'] }, (old: any) => {
    if (!old?.items) return old
    return {
      ...old,
      items: old.items.filter((item: RecordWithId) => item.id !== id),
      totalItems: Math.max(0, old.totalItems - 1),
    }
  })
  
  // Remove detail query
  queryClient.removeQueries({ queryKey: [collection, 'detail', id] })
  
  return { previousData }
}

/**
 * Rollback optimistic updates on error
 */
function rollbackOptimisticUpdate(
  queryClient: QueryClient,
  collection: string,
  context: any
) {
  // Rollback list queries
  if (context?.previousData) {
    context.previousData.forEach(([queryKey, data]: [any, any]) => {
      queryClient.setQueryData(queryKey, data)
    })
  }
  
  // Rollback list data
  if (context?.previousListData) {
    context.previousListData.forEach(([queryKey, data]: [any, any]) => {
      queryClient.setQueryData(queryKey, data)
    })
  }
  
  // Rollback detail data
  if (context?.previousDetailData && context?.id) {
    queryClient.setQueryData([collection, 'detail', context.id], context.previousDetailData)
  }
}

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
 * Create a new record with optimistic updates
 * 
 * @example
 * const createPatient = useCreateRecord('patients')
 * createPatient.mutate({ name: 'John Doe' })
 */
export function useCreateRecord<T extends RecordWithId = RecordWithId>(collection: string) {
  const queryClient = useQueryClient()

  return useMutation(() => ({
    mutationFn: (data: any) => pb.create<T>(collection, data),
    onMutate: async (data: any) => {
      const context = await optimisticCreate<T>(queryClient, collection, data)
      return context
    },
    onError: (_err, _vars, context: any) => {
      rollbackOptimisticUpdate(queryClient, collection, context)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [collection, 'list'] })
    },
  }))
}

/**
 * Update an existing record with optimistic updates
 * 
 * @example
 * const updatePatient = useUpdateRecord('patients')
 * updatePatient.mutate({ id: '123', name: 'Jane Doe' })
 */
export function useUpdateRecord<T extends RecordWithId = RecordWithId>(collection: string) {
  const queryClient = useQueryClient()

  return useMutation(() => ({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      pb.update<T>(collection, id, data),
    onMutate: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const context = await optimisticUpdate<T>(queryClient, collection, id, data as Partial<T>)
      return { ...context, id }
    },
    onError: (_err, _vars, context: any) => {
      rollbackOptimisticUpdate(queryClient, collection, context)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [collection] })
    },
  }))
}

/**
 * Delete a record with optimistic updates
 * 
 * @example
 * const deletePatient = useDeleteRecord('patients')
 * deletePatient.mutate('record-id')
 */
export function useDeleteRecord(collection: string) {
  const queryClient = useQueryClient()

  return useMutation(() => ({
    mutationFn: (id: string) => pb.deleteRecord(collection, id),
    onMutate: async (id: string) => {
      const context = await optimisticDelete(queryClient, collection, id)
      return context
    },
    onError: (_err, _vars, context: any) => {
      rollbackOptimisticUpdate(queryClient, collection, context)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [collection, 'list'] })
    },
  }))
}

/**
 * ✨ OPTIMISTIC UPDATE PATTERN - How it works:
 * 
 * ALL mutations follow the same reliable pattern:
 * 
 * 1. onMutate: Update cache immediately (optimistic)
 *    - Cancel in-flight queries to avoid race conditions
 *    - Snapshot current data for rollback
 *    - Update cache with optimistic data
 * 
 * 2. onError: Rollback if mutation fails
 *    - Restore cache to previous snapshot
 *    - User sees original data again
 * 
 * 3. onSettled: Sync with server
 *    - Invalidate queries to refetch real data
 *    - Ensures cache matches server state
 * 
 * Result: Instant UI updates + automatic error recovery + server sync
 */

// =============================================================================
// REALTIME INTEGRATION - Auto-sync PocketBase realtime with TanStack Query
// =============================================================================
// REALTIME INTEGRATION - Auto-sync PocketBase realtime with TanStack Query
// =============================================================================

import { onMount, onCleanup } from 'solid-js'

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
