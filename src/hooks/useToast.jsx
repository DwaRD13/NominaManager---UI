import { createContext, useContext, useState, useCallback } from 'react'

/**
 * @typedef {{ id: number, title: string, description: string, variant: 'success' | 'error' | 'info' }} ToastItem
 */

const ToastContext = createContext(null)

let _id = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState(/** @type {ToastItem[]} */ ([]))

  const toast = useCallback(({ title, description, variant = 'success' }) => {
    const id = ++_id
    setToasts((prev) => [...prev, { id, title, description, variant }])
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
