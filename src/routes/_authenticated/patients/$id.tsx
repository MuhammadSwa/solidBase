import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/_authenticated/patients/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/patients/$id"!</div>
}
