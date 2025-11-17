interface SelectOption {
  value: string
  label: string
  icon?: string
}

interface SelectProps {
  id?: string
  label?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  class?: string
  size?: "sm" | "md" | "lg"
  required?: boolean
  disabled?: boolean
  helperText?: string
  error?: string
}

/**
 * Reusable select component with consistent styling
 */
export function Select(props: SelectProps) {
  const sizeClasses = () => {
    switch (props.size) {
      case "sm":
        return "px-3 py-1.5 text-sm"
      case "lg":
        return "px-6 py-4 text-lg"
      default:
        return "px-4 py-2 text-sm"
    }
  }

  const handleChange = (e: Event & { currentTarget: HTMLSelectElement }) => {
    props.onChange(e.currentTarget.value)
  }

  return (
    <div class={props.class}>
      {props.label && (
        <label
          for={props.id}
          class="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
        >
          {props.label} {props.required && <span class="text-[var(--color-error)]">*</span>}
        </label>
      )}
      <div class="relative">
        <select
          id={props.id}
          value={props.value}
          onChange={handleChange}
          required={props.required}
          disabled={props.disabled}
          class={`
            w-full ${sizeClasses()}
            border border-[var(--color-border-primary)] 
            rounded-lg 
            bg-[var(--color-bg-primary)] 
            text-[var(--color-text-primary)]
            appearance-none
            cursor-pointer
            focus:outline-none 
            focus:ring-2 
            focus:ring-[var(--color-brand-primary)] 
            focus:border-transparent
            disabled:opacity-50 
            disabled:cursor-not-allowed
            transition-colors
          `}
        >
          {props.placeholder && (
            <option value="" disabled>
              {props.placeholder}
            </option>
          )}
          {props.options.map((option) => (
            <option value={option.value}>
              {option.icon ? `${option.icon} ${option.label}` : option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            class="w-4 h-4 text-[var(--color-text-tertiary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
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
