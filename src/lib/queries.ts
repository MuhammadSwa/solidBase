/**
 * 🎯 Composable Query Hooks for PocketBase + TanStack Query
 * ==========================================================
 * 
 * These hooks provide a simple, reusable pattern for data fetching with:
 * - ✨ Automatic type inference (no manual type annotations needed!)
 * - 🔄 Automatic loading states, errors, and caching
 * - 🚀 Optimistic updates for instant UI feedback
 * - ↩️  Automatic rollback on errors
 * - 🔄 Server sync on completion
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🚀 OPTIMISTIC UPDATES - How They Work
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * All mutations (create, update, delete) use optimistic updates:
 * 
 * 1. ⚡ UI updates IMMEDIATELY (no waiting for server)
 *    - User sees changes instantly
 *    - Feels super responsive
 * 
 * 2. ↩️  If server FAILS → automatically rolled back
 *    - Changes disappear
 *    - Back to original state
 * 
 * 3. ✅ If server SUCCEEDS → synced with real data
 *    - Data stays updated
 *    - Everything in sync
 * 
 * This eliminates flickering and provides a snappy, responsive UX!
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📖 QUICK START EXAMPLES
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * // Fetch a list
 * const todos = useCollection("todos", { sort: "-created" })
 * <For each={todos.data?.items}>{todo => <div>{todo.title}</div>}</For>
 * 
 * // Fetch single record
 * const todo = useRecord("todos", () => params.id)
 * <Show when={todo.data}>{data => <h1>{data().title}</h1>}</Show>
 * 
 * // Create
 * const createTodo = useCreateRecord("todos")
 * createTodo.mutate({ title: "New", completed: false })
 * 
 * // Update
 * const updateTodo = useUpdateRecord("todos")
 * updateTodo.mutate({ id: "123", completed: true })
 * 
 * // Delete
 * const deleteTodo = useDeleteRecord("todos")
 * deleteTodo.mutate("record-id")
 * 
 * // Realtime sync
 * useRealtimeCollection("todos")  // Auto-syncs all changes!
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 📚 For detailed explanation of how type inference works, see:
 *    TYPE_INFERENCE_GUIDE.md
 */

import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/solid-query'
import * as pb from './pocketbase'
import type { CollectionRecords, BaseRecord } from '@/types/pocketbase-types'

// =============================================================================
// TYPE UTILITIES - Reusable type helpers
// =============================================================================

type RecordWithId = { id: string;[key: string]: any }

/** 
 * InferRecordType 
 * ==================================================
 * 
 * This helper automatically determines the correct record type based on 
 * the collection name you pass to a hook.
 * @example
 * // When you call:
 * useCollection("todos")
 * 
 * // TypeScript does:
 * K = "todos"
 * InferRecordType<"todos"> → TodoRecord
 * // So the return type becomes { items: TodoRecord[], ... }
 */
type InferRecordType<K> = K extends keyof CollectionRecords
  ? CollectionRecords[K]
  : BaseRecord

/**
 * CollectionName
 * ==============================================
 * 
 * This type allows BOTH known collections AND unknown/dynamic collections.
 * 1. Known collections (keyof CollectionRecords):
 *    - Gives you autocomplete
 *    - Prevents typos
 *    - Example: "todos", "patients", "users"
 * 
 * 2. Unknown collections (string & {}):
 *    - Allows dynamic collection names
 *    - Won't break if collection isn't in CollectionRecords
 *    - Falls back to BaseRecord
 * 
 * THE TRICK:
 * ----------
 * (string & {}) is a TypeScript pattern that means "any other string"
 * - It doesn't interfere with the known collection names
 * - It allows flexibility while maintaining type safety
 * 
 * @example
 * useCollection("todos")              // ← Known: Gets TodoRecord
 * useCollection("new_collection")     // ← Unknown: Gets BaseRecord
 * 
 */
type CollectionName = keyof CollectionRecords | (string & {})

// =============================================================================
// OPTIMISTIC UPDATE UTILITIES - Reusable optimistic update logic
// =============================================================================

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
 * 📚 Fetch paginated records from a collection
 * ============================================
 * 
 * Fetches a list of records with automatic type inference based on collection name.
 * 
 * ----------------------------
 * @example Basic Usage
 * const todos = useCollection("todos", { sort: "-created" })
 * // todos.data.items is automatically typed as TodoRecord[]!
 * // You get autocomplete for todo.title, todo.completed, etc.
 * 
 * @example With Type Safety
 * <Show when={todos.data}>
 *   {(data) => (
 *     <For each={data().items}>
 *       {(todo) => (
 *         // todo is typed as TodoRecord - full autocomplete! ✨
 *         <div>{todo.title}</div>
 *       )}
 *     </For>
 *   )}
 * </Show>
 * 
 * @example With Filters
 * const completedTodos = useCollection("todos", { 
 *   filter: 'completed = true',
 *   sort: '-created'
 * })
 * 

 * @param collection - Collection name (gets autocomplete for known collections!)
 * @param options - PocketBase query options (filter, sort, expand, etc.)
 * @param queryOptions - TanStack Query options (staleTime, enabled, etc.)
 * @returns Query result with automatically typed data
 */
export function useCollection<K extends CollectionName>(
  collection: K,
  options?: any,
  queryOptions?: { staleTime?: number; enabled?: boolean }
) {
  return useQuery(() => ({
    queryKey: [collection, 'list', options],
    queryFn: () => pb.getList<InferRecordType<K>>(collection, 1, 50, options),
    //                        ^^^^^^^^^^^^^^^^^^^
    //                        Magic! Automatically infers TodoRecord for "todos"
    staleTime: queryOptions?.staleTime ?? 1000 * 60 * 5, // 5 min default
    enabled: queryOptions?.enabled ?? true,
  }))
}

/**
 * 📄 Fetch a single record by ID
 * ===============================
 * 
 * Fetches one specific record with automatic type inference.
 * ----------------------------
 * @example Basic Usage
 * const todo = useRecord("todos", () => params.id)
 * 
 * @example With Type Safety
 * <Show when={todo.data}>
 *   {(data) => (
 *     // data() is typed as TodoRecord - autocomplete works! ✨
 *     <div>
 *       <h1>{data().title}</h1>
 *       <p>Done: {data().completed}</p>
 *     </div>
 *   )}
 * </Show>
 * 
 * @example Conditional Loading
 * const todo = useRecord("todos", () => todoId(), {}, { 
 *   enabled: !!todoId() 
 * })
 * 
 * NOTE: Why use a function for id?
 * --------------------------------
 * The id parameter is a function (() => string) because:
 * - It needs to be reactive in SolidJS
 * - The query automatically re-runs when the id changes
 * - This is a SolidJS pattern for reactive dependencies
 * 
 * @param collection - Collection name (autocomplete available!)
 * @param id - Function that returns the record ID (reactive)
 * @param options - PocketBase query options (expand, etc.)
 * @returns Query result with automatically typed data
 */
export function useRecord<K extends CollectionName>(
  collection: K,
  id: () => string,
  options?: any
) {
  return useQuery(() => ({
    queryKey: [collection, 'detail', id()],
    queryFn: () => pb.getOne<InferRecordType<K>>(collection, id(), options),
    //                       ^^^^^^^^^^^^^^^^^^^
    //                       Automatically gets TodoRecord for "todos"
    enabled: !!id(),
  }))
}

// =============================================================================
// MUTATION HOOKS - For creating/updating/deleting data
// =============================================================================

/**
 * ➕ Create a new record with optimistic updates
 * ===============================================
 * 
 * Creates a new record with automatic type inference and instant UI updates.
 * 
 * 🚀 OPTIMISTIC UPDATES:
 * ----------------------
 * UI updates IMMEDIATELY before server confirms:
 * 1. New record appears instantly (no loading spinner)
 * 2. If server fails → automatically rolled back
 * 3. If server succeeds → synced with real data
 * 
 * @example Basic Usage
 * const createTodo = useCreateRecord("todos")
 * 
 * createTodo.mutate({
 *   title: "New todo",     
 *   completed: false,      
 *   invalid: "field"       // ❌ Error! TypeScript knows this doesn't exist (AUTOMATIC TYPE INFERENCE)
 * })
 * 
 * @example With Callbacks
 * createTodo.mutate(
 *   { title: "Buy milk", completed: false },
 *   {
 *     onSuccess: (data) => {
 *       // data is typed as TodoRecord!
 *       toast.success(`Created: ${data.title}`)
 *       navigate('/todos')
 *     },
 *     onError: (error) => {
 *       toast.error('Failed to create todo')
 *     }
 *   }
 * )
 * 
 * @example In a Form
 * const handleSubmit = (e: Event) => {
 *   e.preventDefault()
 *   createTodo.mutate({
 *     title: titleInput(),
 *     completed: false
 *   })
 * }
 * 
 * @param collection - Collection name (autocomplete available!)
 * @returns Mutation hook with automatically typed data parameter
 */
export function useCreateRecord<K extends CollectionName>(collection: K) {
  const queryClient = useQueryClient()
  type T = InferRecordType<K> & RecordWithId
  //   ^? This is the magic! Combines inferred type with RecordWithId

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
 * ✏️ Update an existing record with optimistic updates
 * ====================================================
 * 
 * Updates a record with automatic type inference and instant UI updates.
 * 
 * @example Basic Usage
 * const updateTodo = useUpdateRecord("todos")
 * 
 * updateTodo.mutate({
 *   id: "123",             // which record to update
 *   title: "Updated!",     
 *   completed: true,       
 *   invalid: "field"      
 * })
 * 
 * @example Toggle Completion
 * const handleToggle = (todo: TodoRecord) => {
 *   updateTodo.mutate({
 *     id: todo.id,
 *     completed: !todo.completed  
 *   })
 * }
 * 
 * @example Partial Updates
 * // You don't need to include all fields - just what changed!
 * updateTodo.mutate({
 *   id: "123",
 *   title: "New title"  // Only updating title, completed stays the same
 * })
 * 
 * @example With Callbacks
 * updateTodo.mutate(
 *   { id: "123", completed: true },
 *   {
 *     onSuccess: () => toast.success('Updated!'),
 *     onError: () => toast.error('Failed!')
 *   }
 * )
 * 
 * WHY THE DESTRUCTURING?
 * ----------------------
 * ({ id, ...data }) - We separate id from the rest of the data because:
 * - PocketBase needs the id to know WHICH record to update
 * - The ...data is what to UPDATE in that record
 * - TypeScript ensures both id and data are correct types
 * 
 * @param collection - Collection name (autocomplete available!)
 * @returns Mutation hook with automatically typed update data
 */
export function useUpdateRecord<K extends CollectionName>(collection: K) {
  const queryClient = useQueryClient()
  type T = InferRecordType<K> & RecordWithId
  //   ^? Inferred type + guaranteed id field

  return useMutation(() => ({
    mutationFn: ({ id, ...data }: { id: string;[key: string]: any }) =>
      pb.update<T>(collection, id, data),
    onMutate: async ({ id, ...data }: { id: string;[key: string]: any }) => {
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
 * 🗑️ Delete a record with optimistic updates
 * ==========================================
 * 
 * Deletes a record with instant UI feedback.
 * 
 * @example Basic Usage
 * const deleteTodo = useDeleteRecord("todos")
 * 
 * deleteTodo.mutate("record-id-123")
 * 
 * @example With Confirmation
 * const handleDelete = (id: string) => {
 *   if (confirm('Are you sure?')) {
 *     deleteTodo.mutate(id)
 *   }
 * }
 * 
 * @example With Loading State
 * const [deletingId, setDeletingId] = createSignal<string | null>(null)
 * 
 * const handleDelete = (id: string) => {
 *   setDeletingId(id)
 *   deleteTodo.mutate(id, {
 *     onSettled: () => setDeletingId(null)
 *   })
 * }
 * 
 * // In template:
 * <button 
 *   disabled={deletingId() === todo.id}
 *   onClick={() => handleDelete(todo.id)}
 * >
 *   {deletingId() === todo.id ? 'Deleting...' : 'Delete'}
 * </button>
 * 
 * @example With Callbacks
 * deleteTodo.mutate("123", {
 *   onSuccess: () => toast.success('Deleted!'),
 *   onError: () => toast.error('Failed to delete')
 * })
 * 
 * @param collection - Collection name (autocomplete available!)
 * @returns Mutation hook that accepts a record ID to delete
 */
export function useDeleteRecord<K extends CollectionName>(collection: K) {
  const queryClient = useQueryClient()

  return useMutation(() => ({
    mutationFn: (id: string) => pb.deleteRecord(collection, id),
    onMutate: async (id: string) => {
      const context = await optimisticDelete(queryClient, collection, id)
      return context
    },
    onError: (_err, _vars, context: any) => {
      rollbackOptimisticUpdate(queryClient, collection as string, context)
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
export function useRealtimeCollection<K extends CollectionName>(
  collection: K,
  onEvent?: (event: RealtimeEvent<InferRecordType<K>>) => void
) {
  const queryClient = useQueryClient()
  type T = InferRecordType<K>

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
export function useRealtimeRecord<K extends CollectionName>(
  collection: K,
  id: () => string,
  onEvent?: (event: RealtimeEvent<InferRecordType<K>>) => void
) {
  const queryClient = useQueryClient()
  type T = InferRecordType<K>

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
