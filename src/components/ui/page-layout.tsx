import type { JSX } from "solid-js"

interface PageLayoutProps {
  children: JSX.Element
  variant?: "default" | "gradient" | "auth"
}

/**
 * Standard page layout wrapper with consistent backgrounds
 */
/**
 * Main page layout wrapper with background
 */
export function PageLayout(props: PageLayoutProps) {
  const bgClass = () => {
    switch (props.variant) {
      case "gradient":
        return "min-h-screen bg-gradient-to-br from-[var(--gradient-primary-from)] to-[var(--gradient-primary-to)]"
      case "auth":
        return "min-h-screen bg-gradient-to-br from-[var(--gradient-secondary-from)] to-[var(--gradient-secondary-to)]"
      default:
        return "min-h-screen bg-[var(--color-bg-secondary)]"
    }
  }

  return <div class={bgClass()}>{props.children}</div>
}

interface PageContainerProps {
  children: JSX.Element
  size?: "sm" | "md" | "lg" | "xl" | "full"
  padding?: boolean
}

/**
 * Content container with max-width constraints
 */
export function PageContainer(props: PageContainerProps) {
  const maxWidth = () => {
    switch (props.size) {
      case "sm":
        return "max-w-2xl"
      case "md":
        return "max-w-4xl"
      case "lg":
        return "max-w-6xl"
      case "xl":
        return "max-w-7xl"
      case "full":
        return "max-w-full"
      default:
        return "max-w-7xl"
    }
  }

  const paddingClass = props.padding !== false ? "px-4 py-8" : ""

  return (
    <div class={`${maxWidth()} mx-auto ${paddingClass}`}>
      {props.children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: JSX.Element
}

/**
 * Page header with title, optional subtitle, and action button
 */
export function PageHeader(props: PageHeaderProps) {
  return (
    <div class="mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-[var(--color-text-primary)]">
            {props.title}
          </h1>
          {props.subtitle && (
            <p class="mt-2 text-[var(--color-text-secondary)]">
              {props.subtitle}
            </p>
          )}
        </div>
        {props.action}
      </div>
    </div>
  )
}
