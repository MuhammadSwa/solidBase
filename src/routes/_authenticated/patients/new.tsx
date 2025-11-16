import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { createSignal } from "solid-js"
import { useCreateRecord } from "@/lib/queries"
import { toast } from "@/lib/toast"
import type { PatientsRecord } from "@/types/pocketbase-types"

export const Route = createFileRoute("/_authenticated/patients/new")({
  component: AddPatientPage,
})

function AddPatientPage() {
  const navigate = useNavigate()
  const [name, setName] = createSignal("")

  const createPatient = useCreateRecord<PatientsRecord>("patients")

  const handleSubmit = (e: Event) => {
    e.preventDefault()

    if (!name().trim()) {
      toast.error("Please enter a patient name")
      return
    }

    const patientName = name().trim()

    // Use optimistic update - navigate immediately!
    createPatient.mutate(
      { name: patientName },
      {
        onSuccess: () => {
          toast.success("Patient added successfully! 🎉")
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to add patient")
        },
      }
    )

    // Navigate immediately (optimistic UI)
    navigate({ to: "/patients" })
  }

  const handleCancel = () => {
    navigate({ to: "/patients" })
  }

  return (
    <div class="min-h-screen bg-gray-50 py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Add New Patient</h1>
          <p class="mt-2 text-gray-600">
            Enter patient information below. Changes will sync in realtime across all connected clients.
          </p>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Patient Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter patient name"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
              />
              <p class="mt-1 text-sm text-gray-500">
                Full name of the patient
              </p>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={createPatient.isPending}
                class="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Add Patient
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={createPatient.isPending}
                class="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 class="text-sm font-medium text-blue-900 mb-2">⚡ Optimistic Updates Enabled</h3>
          <p class="text-sm text-blue-800">
            When you add a patient, you'll be redirected instantly and the new patient
            will appear immediately in the list. The data syncs with the server in the
            background with automatic rollback on errors.
          </p>
        </div>
      </div>
    </div>
  )
}

