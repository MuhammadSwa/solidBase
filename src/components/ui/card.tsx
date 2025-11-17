import type { JSX } from "solid-js"

interface CardProps {
  children: JSX.Element
  padding?: "sm" | "md" | "lg" | "none"
  shadow?: boolean
  class?: string
}

/**
 * Reusable card component with consistent styling
 */
export function Card(props: CardProps) {
  const paddingClass = () => {
    switch (props.padding) {
      case "sm":
        return "p-4"
      case "md":
        return "p-6"
      case "lg":
        return "p-8"
      case "none":
        return ""
      default:
        return "p-6"
    }
  }

  const shadowClass = props.shadow !== false ? "shadow-lg" : "shadow"

  return (
    <div
      class={`bg-[var(--color-bg-primary)] rounded-lg ${shadowClass} border border-[var(--color-border-primary)] ${paddingClass()} ${props.class || ""}`}
    >
      {props.children}
    </div>
  )
}

interface InfoBoxProps {
  children: JSX.Element
  variant?: "info" | "success" | "warning" | "error"
  title?: string
  class?: string
}

/**
 * Colored info/alert box
 */
export function InfoBox(props: InfoBoxProps) {
  const variantClasses = () => {
    switch (props.variant) {
      case "success":
        return "bg-[var(--color-success-bg)] border-[var(--color-success-border)]"
      case "warning":
        return "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)]"
      case "error":
        return "bg-[var(--color-error-bg)] border-[var(--color-error-border)]"
      default:
        return "bg-[var(--color-info-bg)] border-[var(--color-info-border)]"
    }
  }

  const textClass = () => {
    switch (props.variant) {
      case "success":
        return "text-[var(--color-success-text)]"
      case "warning":
        return "text-[var(--color-warning-text)]"
      case "error":
        return "text-[var(--color-error-text)]"
      default:
        return "text-[var(--color-info-text)]"
    }
  }

  const titleTextClass = () => {
    switch (props.variant) {
      case "success":
        return "text-[var(--color-success-text)]"
      case "warning":
        return "text-[var(--color-warning-text)]"
      case "error":
        return "text-[var(--color-error-text)]"
      default:
        return "text-[var(--color-info-text)]"
    }
  }

  return (
    <div class={`p-4 border rounded-lg ${variantClasses()} ${props.class || ""}`}>
      {props.title && (
        <h3 class={`text-sm font-medium ${titleTextClass()} mb-2`}>
          {props.title}
        </h3>
      )}
      <div class={`text-sm ${textClass()}`}>{props.children}</div>
    </div>
  )
}

interface StatsCardProps {
  value: number | string
  label: string
  color?: "blue" | "green" | "orange" | "purple" | "red"
}

/**
 * Statistics card for dashboards
 */
export function StatsCard(props: StatsCardProps) {
  const colorClass = () => {
    switch (props.color) {
      case "green":
        return "text-[var(--color-success)]"
      case "orange":
        return "text-[var(--color-accent-orange)]"
      case "purple":
        return "text-[var(--color-accent-purple)]"
      case "red":
        return "text-[var(--color-error)]"
      default:
        return "text-[var(--color-brand-primary)]"
    }
  }

  return (
    <Card padding="md">
      <div class="text-center">
        <div class={`text-2xl font-bold ${colorClass()}`}>{props.value}</div>
        <div class="text-sm text-[var(--color-text-secondary)]">{props.label}</div>
      </div>
    </Card>
  )
}
