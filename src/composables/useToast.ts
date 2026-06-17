type ToastType = 'success' | 'error' | 'info'
type ToastFn = (message: string, type?: ToastType) => void

const toastFn = ref<ToastFn | null>(null)

export const useToast = () => {
  const register = (fn: ToastFn) => {
    toastFn.value = fn
  }

  const toast = {
    success: (msg: string) => toastFn.value?.(msg, 'success'),
    error: (msg: string) => toastFn.value?.(msg, 'error'),
    info: (msg: string) => toastFn.value?.(msg, 'info'),
  }

  return { toast, register }
}
