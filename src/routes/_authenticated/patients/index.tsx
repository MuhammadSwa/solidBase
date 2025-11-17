import { createFileRoute, Link } from "@tanstack/solid-router"
import { For, Show, Suspense, createSignal } from "solid-js"
import { useCollection, useDeleteRecord, useRealtimeCollection } from "@/lib/queries"
import { useConfirmationDialog } from "@/components/confirmation-dialog"
import { PageLayout, PageContainer, PageHeader, Card } from "@/components/ui"

export const Route = createFileRoute("/_authenticated/patients/")({
  component: PatientsPage,
})

function PatientsPage() {
  // Use the composable query hook - much simpler!
  const patients = useCollection("patients", { sort: "-created" })
  const deletePatient = useDeleteRecord("patients")
  const [deletingId, setDeletingId] = createSignal<string | null>(null)
  const confirmDialog = useConfirmationDialog()

  // 🔥 Enable realtime sync - data updates automatically across all users!
  useRealtimeCollection("patients")

  const handleDelete = (id: string, name: string) => {
    confirmDialog.confirm({
      title: "Delete Patient",
      message: `Are you sure you want to delete patient "${name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: () => {
        setDeletingId(id)
        deletePatient.mutate(id, {
          onSettled: () => setDeletingId(null)
        })
      },
    })
  }

  return (
    <>
      <confirmDialog.ConfirmationDialog />
      <PageLayout>
        <PageContainer size="full">
          <PageHeader 
            title="Patients" 
            action={
              <Link
                to="/patients/new"
                class="px-4 py-2 bg-[var(--color-brand-primary)] text-white rounded hover:bg-[var(--color-brand-primary-hover)] transition"
              >
                Add Patient
              </Link>
            }
          />

        <Card padding="none" shadow={false}>
          <Suspense
            fallback={
              <div class="p-8 text-center text-[var(--color-text-tertiary)]">Loading patients...</div>
            }
          >
            <Show
              when={!patients.isLoading && patients.data}
              fallback={
                <div class="p-8 text-center">
                  <Show when={patients.isError}>
                    <p class="text-[var(--color-error)]">
                      Error: {patients.error?.message || 'Failed to load patients'}
                    </p>
                  </Show>
                </div>
              }
            >
              {(data) => (
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-[var(--color-border-primary)]">
                    <thead class="bg-[var(--color-bg-secondary)]">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                          ID
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                          Name
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                          Created
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-[var(--color-bg-elevated)] divide-y divide-[var(--color-border-primary)]">
                      <For
                        each={data().items}
                        fallback={
                          <tr>
                            <td colspan="4" class="px-6 py-4 text-center text-[var(--color-text-tertiary)]">
                              No patients found
                            </td>
                          </tr>
                        }
                      >
                        {(patient) => {
                          const isDeleting = () => deletingId() === patient.id
                          return (
                            <tr 
                              class="hover:bg-[var(--color-bg-tertiary)] transition-all duration-200"
                              classList={{
                                'opacity-50 bg-[var(--color-error-bg)] pointer-events-none': isDeleting()
                              }}
                            >
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                                {patient.id}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-primary)]">
                                <Link 
                                  to="/patients/$id" 
                                  params={{ id: patient.id }}
                                  class="font-medium text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] hover:underline transition-colors"
                                >
                                  {patient.name}
                                </Link>
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                                {new Date(patient.created).toLocaleDateString()}
                              </td>
                              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link 
                                  to="/patients/$id" 
                                  params={{ id: patient.id }}
                                  class="text-[var(--color-brand-primary)] hover:text-[var(--color-brand-primary-hover)] mr-4 transition-colors"
                                >
                                  View
                                </Link>
                                <button
                                  class="text-[var(--color-error)] hover:text-[var(--color-error-hover)] disabled:opacity-50 transition-colors"
                                  onClick={() => handleDelete(patient.id, patient.name)}
                                  disabled={isDeleting()}
                                >
                                  <Show 
                                    when={!isDeleting()} 
                                    fallback={
                                      <span class="inline-flex items-center">
                                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--color-error)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
        </Card>
        </PageContainer>
      </PageLayout>
    </>
  )
}
