import { createFileRoute } from "@tanstack/solid-router"
import { For, Show, Suspense } from "solid-js"
import { useCollection, useDeleteRecord, useRealtimeCollection } from "../../lib/queries"
import { type PatientsRecord } from "../../types/pocketbase-types"

export const Route = createFileRoute("/_authenticated/patients")({
  component: PatientsPage,
})

function PatientsPage() {
  // Use the composable query hook - much simpler!
  const patients = useCollection<PatientsRecord>("patients", { sort: "-created" })
  const deletePatient = useDeleteRecord("patients")

  // 🔥 Enable realtime sync - data updates automatically across all users!
  useRealtimeCollection("patients")

  return (
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Patients</h1>
          <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Patient
          </button>
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
                            <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                              No patients found
                            </td>
                          </tr>
                        }
                      >
                        {(patient) => (
                          <tr class="hover:bg-gray-50">
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
                              <button class="text-blue-600 hover:text-blue-900 mr-4">
                                Edit
                              </button>
                              <button
                                class="text-red-600 hover:text-red-900 disabled:opacity-50"
                                onClick={() => deletePatient.mutate(patient.id)}
                                disabled={deletePatient.isPending}
                              >
                                {deletePatient.isPending ? 'Deleting...' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        )}
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
