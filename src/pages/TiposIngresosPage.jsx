import { useState } from 'react'
import { Dialog, AlertDialog, Separator, Tooltip } from 'radix-ui'
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import { useTiposIngresos } from '../hooks/useTiposIngresos.js'

// ── Estado inicial del formulario ─────────────────────────────────────────────
const FORM_VACIO = {
  nombre: '',
  dependeDeSalario: false,
  estado: 'Activo',
}

// ── Sub-componente: Badge dependeDeSalario ────────────────────────────────────
function DependeBadge({ depende }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium w-fit ${
        depende
          ? 'bg-primary-100 text-primary-500'
          : 'bg-grey-200 text-grey-500'
      }`}
    >
      {depende ? 'Gravable' : 'No gravable'}
    </span>
  )
}

// ── Sub-componente: Dialog Nuevo / Editar Tipo de Ingreso ────────────────────
function TipoIngresoDialog({ trigger, titulo, itemInicial = null, onGuardar, saving }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [formError, setFormError] = useState(null)

  function handleOpen(val) {
    setOpen(val)
    if (val) {
      setForm(
        itemInicial
          ? {
              nombre: itemInicial.nombre ?? '',
              dependeDeSalario: itemInicial.dependeDeSalario ?? false,
              estado: itemInicial.estado ?? 'Activo',
            }
          : FORM_VACIO
      )
      setFormError(null)
    }
  }

  function set(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleGuardar() {
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio.')
      return
    }

    const payload = {
      ...(itemInicial ? { id: itemInicial.id } : {}),
      nombre: form.nombre.trim(),
      dependeDeSalario: form.dependeDeSalario,
      estado: form.estado,
    }

    try {
      setFormError(null)
      await onGuardar(payload)
      setOpen(false)
    } catch (e) {
      setFormError(e.message)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl border border-grey-200 p-6 w-full max-w-md flex flex-col gap-5 focus:outline-none"
          style={{ boxShadow: '0px 8px 32px 0px rgba(0,0,0,0.12)' }}
        >
          {/* ── Header ── */}
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-lg font-bold text-grey-700">{titulo}</Dialog.Title>
            <Dialog.Description className="text-sm text-grey-400">
              Completá los campos. Los marcados con * son obligatorios.
            </Dialog.Description>
          </div>

          <Separator.Root className="h-px bg-grey-200" />

          {/* ── Campos ── */}
          <div className="flex flex-col gap-4">

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)}
                placeholder="Ej: Salario Base"
                className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            {/* Depende de salario — toggle visual */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-grey-200 bg-grey-100">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-grey-700">Depende del salario</span>
                <span className="text-xs text-grey-400">
                  Indica si este ingreso es gravable (aplica ISR u otros cálculos)
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.dependeDeSalario}
                onClick={() => set('dependeDeSalario', !form.dependeDeSalario)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                  form.dependeDeSalario ? 'bg-primary-400' : 'bg-grey-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    form.dependeDeSalario ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Error del formulario */}
            {formError && (
              <p className="text-xs text-red-500 font-medium">{formError}</p>
            )}
          </div>

          {/* ── Acciones ── */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Dialog.Close asChild>
              <button
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-grey-500 rounded-lg border border-grey-200 hover:bg-grey-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-400 rounded-lg hover:bg-primary-500 transition-colors cursor-pointer disabled:opacity-60"
              style={{ boxShadow: '0px 2px 8px 0px rgba(0,128,128,0.20)' }}
            >
              {saving && <UpdateIcon className="animate-spin" />}
              Guardar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Sub-componente: AlertDialog Eliminar ─────────────────────────────────────
function EliminarDialog({ nombre, onEliminar, saving }) {
  const [open, setOpen] = useState(false)

  async function handleEliminar() {
    await onEliminar()
    setOpen(false)
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="flex items-center justify-center w-8 h-8 rounded-lg text-grey-400 hover:bg-grey-100 hover:text-grey-600 transition-colors cursor-pointer">
          <TrashIcon />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <AlertDialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl border border-grey-200 p-6 w-full max-w-sm flex flex-col gap-4 focus:outline-none"
          style={{ boxShadow: '0px 8px 32px 0px rgba(0,0,0,0.12)' }}
        >
          <AlertDialog.Title className="text-base font-bold text-grey-700">
            ¿Eliminar tipo de ingreso?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-grey-400">
            Estás por eliminar{' '}
            <span className="font-semibold text-grey-700">"{nombre}"</span>.
            Esta acción no se puede deshacer.
          </AlertDialog.Description>
          <div className="flex items-center justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <button
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-grey-500 rounded-lg border border-grey-200 hover:bg-grey-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
            </AlertDialog.Cancel>
            <button
              onClick={handleEliminar}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-grey-600 rounded-lg hover:bg-grey-700 transition-colors cursor-pointer disabled:opacity-60"
            >
              {saving && <UpdateIcon className="animate-spin" />}
              Sí, eliminar
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

// ── Sub-componente: Skeleton de carga ─────────────────────────────────────────
function LoadingRows({ count = 4 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i}>
      <div className="flex items-center justify-between px-5 py-4 animate-pulse">
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-40 bg-grey-200 rounded" />
          <div className="h-2.5 w-20 bg-grey-200 rounded" />
        </div>
        <div className="flex gap-1">
          <div className="w-8 h-8 bg-grey-200 rounded-lg" />
          <div className="w-8 h-8 bg-grey-200 rounded-lg" />
        </div>
      </div>
      {i < count - 1 && <Separator.Root className="h-px bg-grey-200 mx-5" />}
    </div>
  ))
}

// ── Sub-componente: Fila de item de ingreso ───────────────────────────────────
function ItemRow({ item, onActualizar, onEliminar, saving, isLast }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 hover:bg-grey-100 transition-colors">
        {/* Info */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-grey-700">{item.nombre}</span>
          <DependeBadge depende={item.dependeDeSalario} />
        </div>

        {/* Acciones */}
        <Tooltip.Provider delayDuration={300}>
          <div className="flex items-center gap-1">
            {/* Editar */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <TipoIngresoDialog
                  titulo={`Editar — ${item.nombre}`}
                  itemInicial={item}
                  onGuardar={onActualizar}
                  saving={saving}
                  trigger={
                    <button className="flex items-center justify-center w-8 h-8 rounded-lg text-grey-400 hover:bg-primary-100 hover:text-primary-500 transition-colors cursor-pointer">
                      <Pencil1Icon />
                    </button>
                  }
                />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-grey-700 text-white text-xs px-2 py-1 rounded" sideOffset={4}>
                  Editar
                  <Tooltip.Arrow className="fill-grey-700" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            {/* Eliminar */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span>
                  <EliminarDialog
                    nombre={item.nombre}
                    onEliminar={() => onEliminar(item.id)}
                    saving={saving}
                  />
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="bg-grey-700 text-white text-xs px-2 py-1 rounded" sideOffset={4}>
                  Eliminar
                  <Tooltip.Arrow className="fill-grey-700" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        </Tooltip.Provider>
      </div>
      {!isLast && <Separator.Root className="h-px bg-grey-200 mx-5" />}
    </>
  )
}

// ── Sub-componente: Paginación ────────────────────────────────────────────────
function Paginacion({ total, pagina, totalPaginas, rangoDesde, rangoHasta, onPagina }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-grey-200">
      <span className="text-xs text-grey-400">
        {total === 0
          ? 'Sin resultados'
          : <>
              <span className="font-semibold text-grey-700">{rangoDesde}–{rangoHasta}</span>
              {' '}de{' '}
              <span className="font-semibold text-grey-700">{total}</span>
            </>
        }
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPagina(Math.max(1, pagina - 1))}
          disabled={pagina === 1}
          className="flex items-center justify-center w-7 h-7 rounded-lg border border-grey-200 text-grey-400 hover:bg-grey-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon />
        </button>
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPagina(p)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              p === pagina
                ? 'bg-primary-400 text-white'
                : 'border border-grey-200 text-grey-500 hover:bg-grey-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPagina(Math.min(totalPaginas, pagina + 1))}
          disabled={pagina === totalPaginas}
          className="flex items-center justify-center w-7 h-7 rounded-lg border border-grey-200 text-grey-400 hover:bg-grey-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
function TiposIngresosPage() {
  const {
    tiposIngresos,
    loading,
    error,
    busqueda,
    setBusqueda,
    pagina,
    setPagina,
    totalPaginas,
    totalItems,
    rangoDesde,
    rangoHasta,
    crear,
    actualizar,
    eliminar,
    saving,
  } = useTiposIngresos()

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Body ── */}
      <div className="flex flex-col gap-6 px-8 pt-4 pb-8">

        {/* ── Título + breadcrumbs ── */}
        <div className="flex flex-col gap-1 pt-10">
          <h1 className="m-0 text-3xl font-bold text-grey-700">Gestión de Ingresos y Deducciones</h1>
          <nav className="flex items-center gap-1 text-sm">
            <span className="text-grey-400">Dashboard</span>
            <span className="text-grey-400">/</span>
            <span className="font-medium text-grey-700">Ing. y Ded.</span>
          </nav>
        </div>

        {/* ── Error global ── */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* ── Dos columnas ── */}
        <div className="grid grid-cols-2 gap-5 items-start">

          {/* ════════════════════════════
              COLUMNA IZQUIERDA — INGRESOS
          ════════════════════════════ */}
          <div
            className="bg-white rounded-xl border border-grey-200 overflow-hidden"
            style={{ boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.04)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-grey-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-100">
                  <ArrowUpIcon className="text-primary-500 w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-base font-bold text-grey-700">Tipos de Ingresos</h2>
                  <span className="text-xs text-grey-400">
                    {loading ? '...' : `${totalItems} registrado${totalItems !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
              <TipoIngresoDialog
                titulo="Nuevo Tipo de Ingreso"
                onGuardar={crear}
                saving={saving}
                trigger={
                  <button
                    className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-primary-400 rounded-lg hover:bg-primary-500 transition-colors cursor-pointer"
                    style={{ boxShadow: '0px 2px 8px 0px rgba(0,128,128,0.20)' }}
                  >
                    <PlusIcon />
                    Nuevo
                  </button>
                }
              />
            </div>

            {/* Buscador */}
            <div className="px-5 py-3 border-b border-grey-200">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-grey-200 bg-white focus-within:border-primary-400 transition-colors">
                <MagnifyingGlassIcon className="text-grey-300 shrink-0" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="flex-1 text-sm bg-transparent text-grey-700 placeholder:text-grey-300 focus:outline-none"
                />
              </div>
            </div>

            {/* Lista */}
            {loading ? (
              <LoadingRows count={4} />
            ) : tiposIngresos.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm text-grey-400">
                {busqueda
                  ? 'No se encontraron resultados para esa búsqueda.'
                  : 'No hay tipos de ingresos registrados aún.'}
              </div>
            ) : (
              tiposIngresos.map((item, idx) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onActualizar={actualizar}
                  onEliminar={eliminar}
                  saving={saving}
                  isLast={idx === tiposIngresos.length - 1}
                />
              ))
            )}

            {/* Paginación */}
            <Paginacion
              total={totalItems}
              pagina={pagina}
              totalPaginas={totalPaginas}
              rangoDesde={rangoDesde}
              rangoHasta={rangoHasta}
              onPagina={setPagina}
            />
          </div>

          {/* ════════════════════════════
              COLUMNA DERECHA — DEDUCCIONES
              Pendiente de implementación en el backend
          ════════════════════════════ */}
          <div
            className="bg-white rounded-xl border border-grey-200 overflow-hidden"
            style={{ boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.04)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-grey-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-grey-200">
                  <ArrowDownIcon className="text-grey-600 w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-base font-bold text-grey-700">Tipos de Deducciones</h2>
                  <span className="text-xs text-grey-400">Próximamente disponible</span>
                </div>
              </div>
              <button
                disabled
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-primary-400 rounded-lg opacity-40 cursor-not-allowed"
              >
                <PlusIcon />
                Nuevo
              </button>
            </div>

            {/* Placeholder */}
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-grey-100">
                <ArrowDownIcon className="text-grey-400 w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-grey-600">
                  Módulo en desarrollo
                </span>
                <span className="text-xs text-grey-400 max-w-xs">
                  El backend de tipos de deducciones está siendo implementado.
                  Estará disponible en la próxima versión.
                </span>
              </div>
            </div>

            {/* Footer vacío para mantener la altura consistente */}
            <div className="border-t border-grey-200 px-5 py-3">
              <span className="text-xs text-grey-400">0 registrados</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default TiposIngresosPage
