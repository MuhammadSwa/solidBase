/**
 * Simple Toast Notification System
 * Provides visual feedback for user actions
 */

import { createSignal, For, onMount } from 'solid-js'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
}

const [toasts, setToasts] = createSignal<Toast[]>([])
let toastId = 0

/**
 * Show a toast notification
 */
export function showToast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = toastId++
  const toast: Toast = { id, message, type, duration }
  
  setToasts(prev => [...prev, toast])
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

/**
 * Remove a toast
 */
export function removeToast(id: number) {
  setToasts(prev => prev.filter(t => t.id !== id))
}

/**
 * Helper functions
 */
export const toast = {
  success: (message: string, duration?: number) => showToast(message, 'success', duration),
  error: (message: string, duration?: number) => showToast(message, 'error', duration),
  info: (message: string, duration?: number) => showToast(message, 'info', duration),
  warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
}

/**
 * Toast Container Component
 */
export function ToastContainer() {
  return (
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <For each={toasts()}>
        {(toast) => <ToastItem toast={toast} />}
      </For>
    </div>
  )
}

/**
 * Individual Toast Item
 */
function ToastItem(props: { toast: Toast }) {
  const [isVisible, setIsVisible] = createSignal(false)
  
  onMount(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10)
  })
  
  const getStyles = () => {
    switch (props.toast.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/90 border-green-500 dark:border-green-600 text-green-900 dark:text-green-100'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/90 border-red-500 dark:border-red-600 text-red-900 dark:text-red-100'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/90 border-yellow-500 dark:border-yellow-600 text-yellow-900 dark:text-yellow-100'
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/90 border-blue-500 dark:border-blue-600 text-blue-900 dark:text-blue-100'
    }
  }
  
  const getIcon = () => {
    switch (props.toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
      default:
        return 'ℹ'
    }
  }
  
  return (
    <div
      class={`
        ${getStyles()}
        border-l-4 p-4 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isVisible() ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        min-w-[300px] max-w-md
      `}
    >
      <div class="flex items-center gap-3">
        <div class="text-xl font-bold">{getIcon()}</div>
        <p class="text-sm font-medium flex-1">{props.toast.message}</p>
        <button
          onClick={() => removeToast(props.toast.id)}
          class="text-lg font-bold opacity-50 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  )
}
