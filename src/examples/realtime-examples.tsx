// /**
//  * 🎯 PocketBase + TanStack Query Realtime Examples
//  * 
//  * This file demonstrates various ways to use the realtime integration.
//  * Copy any example to your components!
//  */
//
// import { createSignal, For, Show } from 'solid-js'
// import { useParams } from '@tanstack/solid-router'
// import { useQueryClient } from '@tanstack/solid-query'
// import {
//   useCollection,
//   useRecord,
//   useCreateRecord,
//   useUpdateRecord,
//   useDeleteRecord,
//   useRealtimeCollection,
//   useRealtimeRecord,
//   useRealtimeSubscription,
// } from '@/lib/queries'
// import { pb } from '@/lib/pocketbase'
//
// // =============================================================================
// // Example 1: Basic Realtime List
// // Most common use case - just add one line!
// // =============================================================================
//
// function Example1_BasicRealtimeList() {
//   const patients = useCollection('patients', { sort: '-created' })
//
//   // ✨ That's it! Data syncs automatically across all users
//   useRealtimeCollection('patients')
//
//   return (
//     <Show when={patients.data}>
//       {(data) => (
//         <For each={data().items}>
//           {(patient) => <div>{patient.id}</div>}
//         </For>
//       )}
//     </Show>
//   )
// }
//
// // =============================================================================
// // Example 2: Realtime Detail Page
// // Single record that updates in realtime
// // =============================================================================
//
// function Example2_RealtimeDetailPage() {
//   const params = useParams<{ id: string }>()
//   const patient = useRecord('patients', () => params.id)
//
//   // ✨ This specific record updates in realtime
//   useRealtimeRecord('patients', () => params.id)
//
//   return (
//     <Show when={patient.data}>
//       {(data) => (
//         <div>
//           <h1>Patient ID: {data().id}</h1>
//           <p>Created: {data().created}</p>
//           {/* Updates instantly when another user edits this patient */}
//         </div>
//       )}
//     </Show>
//   )
// }
//
// // =============================================================================
// // Example 3: Realtime with Notifications
// // Show toast notifications when data changes
// // =============================================================================
//
// function Example3_RealtimeWithNotifications() {
//   const patients = useCollection('patients')
//
//   // Custom event handler for notifications
//   useRealtimeCollection('patients', (event) => {
//     switch (event.action) {
//       case 'create':
//         console.log(`✨ New patient added!`)
//         break
//       case 'update':
//         console.log(`📝 Patient updated: ${event.record.id}`)
//         break
//       case 'delete':
//         console.log(`🗑️ Patient deleted`)
//         break
//     }
//   })
//
//   return <div>Check console for realtime events!</div>
// }
//
// // =============================================================================
// // Example 4: Multiple Realtime Collections
// // Subscribe to multiple collections in one component
// // =============================================================================
//
// function Example4_MultipleCollections() {
//   const patients = useCollection('patients')
//   const appointments = useCollection('appointments')
//   const doctors = useCollection('doctors')
//
//   // Each collection syncs independently
//   useRealtimeCollection('patients')
//   useRealtimeCollection('appointments')
//   useRealtimeCollection('doctors')
//
//   return (
//     <div>
//       <h2>All three collections update in realtime!</h2>
//       <p>Patients: {patients.data?.items.length}</p>
//       <p>Appointments: {appointments.data?.items.length}</p>
//       <p>Doctors: {doctors.data?.items.length}</p>
//     </div>
//   )
// }
//
// // =============================================================================
// // Example 5: Realtime CRUD with Optimistic Updates
// // Combine realtime with mutations for instant UI feedback
// // =============================================================================
//
// function Example5_RealtimeCRUD() {
//   const patients = useCollection('patients')
//   const createPatient = useCreateRecord('patients')
//   const updatePatient = useUpdateRecord('patients')
//   const deletePatient = useDeleteRecord('patients')
//
//   // Realtime keeps everyone else in sync
//   useRealtimeCollection('patients')
//
//   const handleCreate = () => {
//     createPatient.mutate({
//       name: 'New Patient',
//       status: 'active',
//     })
//     // Your mutation completes instantly (optimistic)
//     // Other users see it via realtime after server confirms
//   }
//
//   const handleUpdate = (id: string) => {
//     updatePatient.mutate({
//       id,
//       status: 'inactive',
//     })
//   }
//
//   const handleDelete = (id: string) => {
//     deletePatient.mutate(id)
//   }
//
//   return (
//     <div>
//       <button onClick={handleCreate}>Create Patient</button>
//       <Show when={patients.data}>
//         {(data) => (
//           <For each={data().items}>
//             {(patient) => (
//               <div>
//                 <span>{patient.id}</span>
//                 <button onClick={() => handleUpdate(patient.id)}>Update</button>
//                 <button onClick={() => handleDelete(patient.id)}>Delete</button>
//               </div>
//             )}
//           </For>
//         )}
//       </Show>
//     </div>
//   )
// }
//
// // =============================================================================
// // Example 6: Conditional Realtime Based on Filters
// // Only sync specific records
// // =============================================================================
//
// function Example6_FilteredRealtime() {
//   const queryClient = useQueryClient()
//
//   // Only invalidate cache for urgent patients
//   useRealtimeSubscription(() =>
//     pb.pb.collection('patients').subscribe('*', (e) => {
//       const event = e as any
//
//       if (event.record.status === 'urgent') {
//         console.log('🚨 Urgent patient update!')
//         queryClient.invalidateQueries({ queryKey: ['patients', 'urgent'] })
//       }
//     })
//   )
//
//   return <div>Only urgent patients trigger cache updates</div>
// }
//
// // =============================================================================
// // Example 7: Realtime Dashboard with Multiple Queries
// // Complex dashboard with realtime stats
// // =============================================================================
//
// function Example7_RealtimeDashboard() {
//   const queryClient = useQueryClient()
//
//   // Various queries
//   const allPatients = useCollection('patients')
//   const activePatients = useCollection('patients', { filter: 'status="active"' })
//   const recentAppointments = useCollection('appointments', { 
//     sort: '-created',
//     filter: `created >= "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}"` 
//   })
//
//   // Sync all patient data
//   useRealtimeCollection('patients', (event) => {
//     console.log(`Patient ${event.action}:`, event.record.id)
//
//     // Optionally invalidate related queries
//     if (event.action === 'create' || event.action === 'update') {
//       queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
//     }
//   })
//
//   // Sync appointments
//   useRealtimeCollection('appointments')
//
//   return (
//     <div class="grid grid-cols-3 gap-4">
//       <div class="stat-card">
//         <h3>Total Patients</h3>
//         <p class="text-4xl">{allPatients.data?.totalItems ?? 0}</p>
//       </div>
//       <div class="stat-card">
//         <h3>Active Patients</h3>
//         <p class="text-4xl">{activePatients.data?.totalItems ?? 0}</p>
//       </div>
//       <div class="stat-card">
//         <h3>Recent Appointments</h3>
//         <p class="text-4xl">{recentAppointments.data?.totalItems ?? 0}</p>
//       </div>
//     </div>
//   )
// }
//
// // =============================================================================
// // Example 8: Master-Detail with Realtime
// // List and detail views both sync
// // =============================================================================
//
// function Example8_MasterDetail() {
//   const [selectedId, setSelectedId] = createSignal<string | null>(null)
//
//   const patients = useCollection('patients')
//   const selectedPatient = useRecord('patients', () => selectedId() || '')
//
//   // Both list and detail sync
//   useRealtimeCollection('patients')
//   useRealtimeRecord('patients', () => selectedId() || '')
//
//   return (
//     <div class="flex gap-4">
//       {/* Master: List */}
//       <div class="w-1/3">
//         <h2>Patients (realtime)</h2>
//         <Show when={patients.data}>
//           {(data) => (
//             <For each={data().items}>
//               {(patient) => (
//                 <div 
//                   class="cursor-pointer p-2 hover:bg-gray-100"
//                   onClick={() => setSelectedId(patient.id)}
//                 >
//                   {patient.id}
//                 </div>
//               )}
//             </For>
//           )}
//         </Show>
//       </div>
//
//       {/* Detail: Selected item */}
//       <div class="w-2/3">
//         <h2>Detail (realtime)</h2>
//         <Show when={selectedPatient.data}>
//           {(data) => (
//             <div>
//               <p>ID: {data().id}</p>
//               <p>Created: {data().created}</p>
//               {/* Updates in realtime! */}
//             </div>
//           )}
//         </Show>
//       </div>
//     </div>
//   )
// }
//
// // =============================================================================
// // Example 9: Realtime with Authentication
// // Only sync when user is authenticated
// // =============================================================================
//
// function Example9_RealtimeWithAuth() {
//   const patients = useCollection('patients')
//
//   // PocketBase automatically handles auth for subscriptions
//   // If user loses auth, subscription will fail gracefully
//   useRealtimeCollection('patients', (event) => {
//     console.log('Authenticated user saw update:', event.action)
//   })
//
//   return <div>Realtime syncs based on your permissions</div>
// }
//
// // =============================================================================
// // Example 10: Advanced - Custom Cache Update Strategy
// // Full control over how realtime events update the cache
// // =============================================================================
//
// function Example10_CustomCacheStrategy() {
//   const queryClient = useQueryClient()
//
//   useRealtimeSubscription(() =>
//     pb.pb.collection('patients').subscribe('*', (e) => {
//       const event = e as any
//
//       switch (event.action) {
//         case 'create':
//           // Add to cache manually (optimistic approach)
//           queryClient.setQueryData<any>(['patients', 'list'], (old) => {
//             if (!old) return old
//             return {
//               ...old,
//               items: [event.record, ...old.items],
//               totalItems: old.totalItems + 1,
//             }
//           })
//           break
//
//         case 'update':
//           // Update specific item in list
//           queryClient.setQueryData<any>(['patients', 'list'], (old) => {
//             if (!old) return old
//             return {
//               ...old,
//               items: old.items.map((item: any) =>
//                 item.id === event.record.id ? event.record : item
//               ),
//             }
//           })
//           // Also update detail cache
//           queryClient.setQueryData(['patients', 'detail', event.record.id], event.record)
//           break
//
//         case 'delete':
//           // Remove from cache
//           queryClient.setQueryData<any>(['patients', 'list'], (old) => {
//             if (!old) return old
//             return {
//               ...old,
//               items: old.items.filter((item: any) => item.id !== event.record.id),
//               totalItems: old.totalItems - 1,
//             }
//           })
//           queryClient.removeQueries({ queryKey: ['patients', 'detail', event.record.id] })
//           break
//       }
//     })
//   )
//
//   return <div>Custom cache updates for maximum control</div>
// }
//
// // =============================================================================
// // Export examples for easy discovery
// // =============================================================================
//
// export const RealtimeExamples = {
//   BasicRealtimeList: Example1_BasicRealtimeList,
//   RealtimeDetailPage: Example2_RealtimeDetailPage,
//   RealtimeWithNotifications: Example3_RealtimeWithNotifications,
//   MultipleCollections: Example4_MultipleCollections,
//   RealtimeCRUD: Example5_RealtimeCRUD,
//   FilteredRealtime: Example6_FilteredRealtime,
//   RealtimeDashboard: Example7_RealtimeDashboard,
//   MasterDetail: Example8_MasterDetail,
//   RealtimeWithAuth: Example9_RealtimeWithAuth,
//   CustomCacheStrategy: Example10_CustomCacheStrategy,
// }
