import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { createSignal } from "solid-js"
import { useCreateRecord } from "@/lib/queries"
import { toast } from "@/components/toast"
import { PageLayout, PageContainer, PageHeader, Card, InfoBox, FormField, FormActions, Button } from "@/components/ui"

export const Route = createFileRoute("/_authenticated/patients/new")({
  component: AddPatientPage,
})

function AddPatientPage() {
  const navigate = useNavigate()
  const [name, setName] = createSignal("")

  const createPatient = useCreateRecord("patients")

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
    <PageLayout>
      <PageContainer size="sm" padding>
        <PageHeader
          title="Add New Patient"
          subtitle="Enter patient information below. Changes will sync in realtime across all connected clients."
        />

        <Card>
          <form onSubmit={handleSubmit} class="space-y-6">
            <FormField
              id="name"
              label="Patient Name"
              type="text"
              required
              placeholder="Enter patient name"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              helperText="Full name of the patient"
            />

            <FormActions>
              <Button
                type="submit"
                variant="primary"
                disabled={createPatient.isPending}
                class="flex-1"
              >
                Add Patient
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                disabled={createPatient.isPending}
              >
                Cancel
              </Button>
            </FormActions>
          </form>
        </Card>

        <div class="mt-6">
          <InfoBox variant="info" title="⚡ Optimistic Updates Enabled">
            <p>
              When you add a patient, you'll be redirected instantly and the new patient
              will appear immediately in the list. The data syncs with the server in the
              background with automatic rollback on errors.
            </p>
          </InfoBox>
        </div>
      </PageContainer>
    </PageLayout>
  )
}

