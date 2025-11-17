import type { JSX } from "solid-js"

interface ButtonProps {
  children: JSX.Element | string
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost"
  size?: "sm" | "md" | "lg"
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  onClick?: () => void
  class?: string
}

/**
 * Reusable button component with consistent styling
 */
export function Button(props: ButtonProps) {
  const baseClasses = "font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

  const variantClasses = () => {
    switch (props.variant) {
      case "secondary":
        return "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] focus:ring-[var(--color-border-focus)]"
      case "danger":
        return "bg-[var(--color-error)] text-white hover:bg-[var(--color-error-hover)] focus:ring-[var(--color-error)]"
      case "success":
        return "bg-[var(--color-success)] text-white hover:bg-[var(--color-success-hover)] focus:ring-[var(--color-success)]"
      case "ghost":
        return "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] focus:ring-[var(--color-border-focus)]"
      default:
        return "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)] focus:ring-[var(--color-brand-primary)]"
    }
  }

  const sizeClasses = () => {
    switch (props.size) {
      case "sm":
        return "px-3 py-1.5 text-sm"
      case "lg":
        return "px-8 py-4 text-lg"
      default:
        return "px-6 py-3 text-sm"
    }
  }

  return (
    <button
      type={props.type || "button"}
      class={`${baseClasses} ${variantClasses()} ${sizeClasses()} ${props.class || ""}`}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}

interface LinkButtonProps extends ButtonProps {
  to?: string
}

/**
 * Button styled as a link (for react-router or tanstack-router)
 */
export function LinkButton(props: LinkButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md"

  const variantClasses = () => {
    switch (props.variant) {
      case "secondary":
        return "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
      case "danger":
        return "bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
      case "success":
        return "bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-600"
      default:
        return "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
    }
  }

  const sizeClasses = () => {
    switch (props.size) {
      case "sm":
        return "px-3 py-1.5 text-sm"
      case "lg":
        return "px-8 py-4 text-lg"
      default:
        return "px-6 py-3"
    }
  }

  return (
    <a
      href={props.to}
      class={`${baseClasses} ${variantClasses()} ${sizeClasses()} ${props.class || ""}`}
    >
      {props.children}
    </a>
  )
}
