import { Show, createSignal, onCleanup, onMount, createEffect } from "solid-js"
import { Portal } from "solid-js/web"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
}

export function ConfirmationDialog(props: ConfirmationDialogProps) {
  let dialogRef: HTMLDivElement | undefined
  let confirmButtonRef: HTMLButtonElement | undefined
  let cancelButtonRef: HTMLButtonElement | undefined
  let previousActiveElement: HTMLElement | null = null

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!props.isOpen) return
    
    if (e.key === "Escape") {
      e.preventDefault()
      props.onClose()
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      props.onConfirm()
      props.onClose()
    } else if (e.key === "Tab") {
      // Focus trap - cycle between cancel and confirm buttons
      e.preventDefault()
      const focusableElements = [cancelButtonRef, confirmButtonRef].filter(Boolean)
      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLButtonElement)
      
      if (e.shiftKey) {
        // Shift+Tab - go backwards
        const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
        focusableElements[prevIndex]?.focus()
      } else {
        // Tab - go forwards
        const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1
        focusableElements[nextIndex]?.focus()
      }
    }
  }

  // Save and restore focus
  createEffect(() => {
    if (props.isOpen) {
      // Save the currently focused element
      previousActiveElement = document.activeElement as HTMLElement
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Focus the confirm button after a short delay
      setTimeout(() => {
        confirmButtonRef?.focus()
      }, 100)
    } else {
      // Restore body scroll
      document.body.style.overflow = ''
      
      // Restore focus to the previously focused element
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus()
      }
    }
  })

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown)
  })

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown)
    document.body.style.overflow = ''
  })

  return (
    <Show when={props.isOpen}>
      <Portal>
        {/* Backdrop with blur effect */}
        <div
          class="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity z-40 animate-in fade-in duration-200"
          aria-hidden="true"
        />
        
        {/* Dialog */}
        <div 
          class="fixed inset-0 z-50 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          onClick={props.onClose}
        >
          <div 
            class="flex min-h-full items-center justify-center p-4 text-center"
            onClick={props.onClose}
          >
            <div
              ref={dialogRef}
              class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all w-full max-w-lg animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <div
                    class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10"
                    classList={{
                      "bg-red-100 dark:bg-red-900/50": props.isDangerous,
                      "bg-blue-100 dark:bg-blue-900/50": !props.isDangerous,
                    }}
                  >
                    <Show
                      when={props.isDangerous}
                      fallback={
                        <svg
                          class="h-6 w-6 text-blue-600 dark:text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                          />
                        </svg>
                      }
                    >
                      <svg
                        class="h-6 w-6 text-red-600 dark:text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                    </Show>
                  </div>
                  
                  {/* Content */}
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <h3 
                      id="dialog-title"
                      class="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100"
                    >
                      {props.title}
                    </h3>
                    <div class="mt-2">
                      <p 
                        id="dialog-description"
                        class="text-sm text-gray-500 dark:text-gray-400"
                      >
                        {props.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
                <button
                  ref={confirmButtonRef}
                  type="button"
                  class="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                  classList={{
                    "bg-red-600 dark:bg-red-500 hover:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500": props.isDangerous,
                    "bg-blue-600 dark:bg-blue-500 hover:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500": !props.isDangerous,
                  }}
                  onClick={() => {
                    props.onConfirm()
                    props.onClose()
                  }}
                  aria-label={`${props.confirmText || "Confirm"} - Press Enter to confirm`}
                >
                  {props.confirmText || "Confirm"}
                  <span class="ml-2 text-xs opacity-70" aria-hidden="true">(Enter)</span>
                </button>
                <button
                  ref={cancelButtonRef}
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={props.onClose}
                  aria-label={`${props.cancelText || "Cancel"} - Press Escape to cancel`}
                >
                  {props.cancelText || "Cancel"}
                  <span class="ml-2 text-xs opacity-70" aria-hidden="true">(Esc)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}

// Hook for easier usage
export function useConfirmationDialog() {
  const [isOpen, setIsOpen] = createSignal(false)
  const [config, setConfig] = createSignal<{
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDangerous?: boolean
    onConfirm: () => void
  }>({
    title: "",
    message: "",
    onConfirm: () => {},
  })

  const confirm = (options: {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    isDangerous?: boolean
    onConfirm: () => void
  }) => {
    setConfig(options)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    config,
    confirm,
    close,
    ConfirmationDialog: () => (
      <ConfirmationDialog
        isOpen={isOpen()}
        onClose={close}
        onConfirm={config().onConfirm}
        title={config().title}
        message={config().message}
        confirmText={config().confirmText}
        cancelText={config().cancelText}
        isDangerous={config().isDangerous}
      />
    ),
  }
}
