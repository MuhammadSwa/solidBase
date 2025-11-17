import type { JSX } from "solid-js"

interface FormFieldProps {
  label: string
  id: string
  type?: string
  name?: string
  required?: boolean
  placeholder?: string
  value?: string
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void
  autocomplete?: string
  helperText?: string
  error?: string
}

/**
 * Reusable form field with label and helper text
 */
export function FormField(props: FormFieldProps) {
  return (
    <div>
      <label
        for={props.id}
        class="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
      >
        {props.label} {props.required && <span class="text-[var(--color-error)]">*</span>}
      </label>
      <input
        id={props.id}
        name={props.name || props.id}
        type={props.type || "text"}
        required={props.required}
        autocomplete={props.autocomplete}
        class="w-full px-4 py-2 border border-[var(--color-border-primary)] rounded-lg bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent"
        placeholder={props.placeholder}
        value={props.value}
        onInput={props.onInput}
      />
      {props.helperText && (
        <p class="mt-1 text-sm text-[var(--color-text-tertiary)]">
          {props.helperText}
        </p>
      )}
      {props.error && (
        <p class="mt-1 text-sm text-[var(--color-error)]">{props.error}</p>
      )}
    </div>
  )
}

interface FormGroupProps {
  children: JSX.Element
  rounded?: "top" | "bottom" | "none"
}

/**
 * Auth form group for stacked inputs (like login/signup)
 */
export function FormGroup(props: FormGroupProps) {
  return (
    <div class="rounded-md shadow-sm -space-y-px">
      {props.children}
    </div>
  )
}

interface AuthInputProps {
  id: string
  label: string
  type?: string
  name?: string
  required?: boolean
  placeholder?: string
  value?: string
  onInput?: (e: InputEvent & { currentTarget: HTMLInputElement }) => void
  autocomplete?: string
  position?: "top" | "middle" | "bottom" | "single"
}

/**
 * Auth-specific input field (for stacked forms)
 */
export function AuthInput(props: AuthInputProps) {
  const roundedClass = () => {
    switch (props.position) {
      case "top":
        return "rounded-t-md"
      case "bottom":
        return "rounded-b-md"
      case "single":
        return "rounded-md"
      default:
        return "rounded-none"
    }
  }

  return (
    <div>
      <label for={props.id} class="sr-only">
        {props.label}
      </label>
      <input
        id={props.id}
        name={props.name || props.id}
        type={props.type || "text"}
        autocomplete={props.autocomplete}
        required={props.required}
        class={`appearance-none relative block w-full px-3 py-2 border border-[var(--color-border-primary)] placeholder-[var(--color-text-tertiary)] text-[var(--color-text-primary)] bg-[var(--color-bg-primary)] ${roundedClass()} focus:outline-none focus:ring-[var(--color-brand-primary)] focus:border-[var(--color-brand-primary)] focus:z-10 sm:text-sm`}
        placeholder={props.placeholder}
        value={props.value}
        onInput={props.onInput}
      />
    </div>
  )
}

interface FormActionsProps {
  children: JSX.Element
}

/**
 * Form action buttons container
 */
export function FormActions(props: FormActionsProps) {
  return <div class="flex gap-4 pt-4">{props.children}</div>
}
