import { createFileRoute, Link } from "@tanstack/solid-router"
import { For, Show, Suspense, createSignal } from "solid-js"
import { useCollection, useDeleteRecord, useRealtimeCollection } from "@/lib/queries"
import { type PatientsRecord } from "@/types/pocketbase-types"

export const Route = createFileRoute("/_authenticated/patients/")({
  component: PatientsPage,
})

function PatientsPage() {
  // Use the composable query hook - much simpler!
  const patients = useCollection<PatientsRecord>("patients", { sort: "-created" })
  const deletePatient = useDeleteRecord("patients")
  const [deletingId, setDeletingId] = createSignal<string | null>(null)

  // 🔥 Enable realtime sync - data updates automatically across all users!
  useRealtimeCollection("patients")

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete patient "${name}"?`)) {
      setDeletingId(id)
      deletePatient.mutate(id, {
        onSettled: () => setDeletingId(null)
      })
    }
  }

  return (
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Patients</h1>
          <Link
            to="/patients/new"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add Patient
          </Link>
        </div>

        <div class="bg-white shadow rounded-lg overflow-hidden">
          <Suspense
            fallback={
              <div class="p-8 text-center text-gray-500">Loading patients...</div>
            }
          >
            <Show
              when={!patients.isLoading && patients.data}
              fallback={
                <div class="p-8 text-center">
                  <Show when={patients.isError}>
                    <p class="text-red-600">
                      Error: {patients.error?.message || 'Failed to load patients'}
                    </p>
                  </Show>
                </div>
              }
            >
              {(data) => (
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <For
                        each={data().items}
                        fallback={
                          <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                              No patients found
                            </td>
                          </tr>
                        }
                      >
                        {(patient) => {
                          const isDeleting = () => deletingId() === patient.id
                          return (
                            <tr 
                              class="hover:bg-gray-50 transition-all duration-200"
                              classList={{
                                'opacity-50 bg-red-50': isDeleting(),
                                'pointer-events-none': isDeleting()
                              }}
                            >
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {patient.id}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {patient.name}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(patient.created).toLocaleDateString()}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button class="text-blue-600 hover:text-blue-900 mr-4 transition-colors">
                                  Edit
                                </button>
                                <button
                                  class="text-red-600 hover:text-red-900 disabled:opacity-50 transition-colors"
                                  onClick={() => handleDelete(patient.id, patient.name)}
                                  disabled={isDeleting()}
                                >
                                  <Show 
                                    when={!isDeleting()} 
                                    fallback={
                                      <span class="inline-flex items-center">
                                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                      </span>
                                    }
                                  >
                                    Delete
                                  </Show>
                                </button>
                              </td>
                            </tr>
                          )
                        }}
                      </For>
                    </tbody>
                  </table>
                </div>
              )}
            </Show>
          </Suspense>
        </div>
      </div>
    </div>
  )
}
