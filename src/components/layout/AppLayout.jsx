import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Toast } from 'radix-ui'
import { Cross2Icon, CheckCircledIcon, CrossCircledIcon, InfoCircledIcon } from '@radix-ui/react-icons'
import Sidebar from './Sidebar.jsx'
import { ToastProvider, useToast } from '../../hooks/useToast.jsx'

// ── Toast individual ──
function ToastItem({ t, dismiss }) {
  return (
    <Toast.Root
      open={true}
      onOpenChange={(open) => { if (!open) dismiss(t.id) }}
      duration={4000}
      type="foreground"
      className={`ToastRoot flex items-start gap-3 p-4 rounded-xl border bg-white w-80 ${
        t.variant === 'success' ? 'border-primary-300' :
        t.variant === 'error'   ? 'border-grey-400'    :
                                  'border-grey-200'
      }`}
      style={{ boxShadow: '0px 8px 32px 0px rgba(0,0,0,0.14)' }}
    >
      {/* ── Ícono ── */}
      <span className="flex-shrink-0 mt-0.5">
        {t.variant === 'success' && <CheckCircledIcon  width={20} height={20} className="text-primary-400" />}
        {t.variant === 'error'   && <CrossCircledIcon  width={20} height={20} className="text-grey-600"    />}
        {t.variant === 'info'    && <InfoCircledIcon   width={20} height={20} className="text-grey-400"    />}
      </span>

      {/* ── Texto ── */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        {t.title && (
          <Toast.Title className="text-sm font-semibold text-grey-700 leading-tight">
            {t.title}
          </Toast.Title>
        )}
        {t.description && (
          <Toast.Description className="text-xs text-grey-400 leading-snug">
            {t.description}
          </Toast.Description>
        )}
      </div>

      {/* ── Cerrar ── */}
      <Toast.Close asChild>
        <button
          aria-label="Cerrar notificación"
          className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-md text-grey-300 hover:text-grey-600 hover:bg-grey-100 transition-colors cursor-pointer"
        >
          <Cross2Icon width={12} height={12} />
        </button>
      </Toast.Close>
    </Toast.Root>
  )
}

// ── Renderizador de la lista + Viewport ──
function ToastRegion() {
  const { toasts, dismiss } = useToast()
  return (
    <>
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} dismiss={dismiss} />
      ))}
      <Toast.Viewport className="ToastViewport" />
    </>
  )
}

// ── Layout interno (necesita acceso al contexto del ToastProvider propio) ──
function AppLayoutInner() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="flex min-h-screen bg-grey-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

// ── Root: ToastProvider (contexto propio) wrappea Todo,
//    Toast.Provider (Radix) gestiona el portal hacia el Viewport ──
function AppLayout() {
  return (
    <ToastProvider>
      <Toast.Provider swipeDirection="right" duration={4000}>
        <AppLayoutInner />
        <ToastRegion />
      </Toast.Provider>
    </ToastProvider>
  )
}

export default AppLayout
