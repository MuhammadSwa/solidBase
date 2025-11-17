import { createSignal, onMount, createEffect } from "solid-js"
import { Select } from "./ui/select"

type Theme = "light" | "dark" | "system"

export function DarkModeToggle() {
  const [theme, setTheme] = createSignal<Theme>("system")
  
  // Initialize theme on mount
  onMount(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  })

  // Apply theme whenever it changes
  createEffect(() => {
    const currentTheme = theme()
    
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else if (currentTheme === "light") {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      // System theme
      localStorage.removeItem("theme")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  })

  const themeOptions = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "💻" }
  ]

  return (
    <Select
      options={themeOptions}
      value={theme()}
      onChange={(value) => setTheme(value as Theme)}
      size="sm"
      class="w-40"
    />
  )
}
