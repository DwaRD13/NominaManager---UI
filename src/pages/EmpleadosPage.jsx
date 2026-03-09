import { useState } from 'react'
import { Dialog, Select, Separator, AlertDialog, Tooltip } from 'radix-ui'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import { useEmpleados } from '../hooks/useEmpleados.js'
import { useToast } from '../hooks/useToast.jsx'

// Importación lazy de las funciones de exportación — las librerías (jsPDF, xlsx)
// solo se cargan cuando el usuario hace click, no al abrir la página.
async function handleExportarPDF(empleados) {
  const { exportarEmpleadosPDF } = await import('../lib/exportar.js')
  exportarEmpleadosPDF(empleados)
}

async function handleExportarXLSX(empleados) {
  const { exportarEmpleadosXLSX } = await import('../lib/exportar.js')
  exportarEmpleadosXLSX(empleados)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Genera iniciales a partir del nombre completo */
function getIniciales(nombre = '') {
  const partes = nombre.trim().split(' ')
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

/** Formatea un BigDecimal/number como moneda */
function formatSalario(valor) {
  if (valor == null) return '—'
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

// ── Sub-componente: Avatar de iniciales ──────────────────────────────────────
function Avatar({ nombre }) {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-400 shrink-0">
      <span className="text-xs font-semibold text-white">{getIniciales(nombre)}</span>
    </div>
  )
}

// ── Sub-componente: Badge de estado ──────────────────────────────────────────
function EstadoBadge({ estado }) {
  const isActivo = estado?.toUpperCase() === 'ACTIVO'
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold w-fit ${
        isActivo
          ? 'bg-primary-100 text-primary-500'
          : 'bg-grey-200 text-grey-500'
      }`}
    >
      {estado ?? '—'}
    </span>
  )
}

// ── Estado inicial del formulario ─────────────────────────────────────────────
const FORM_VACIO = {
  nombre: '',
  cedula: '',
  departamento: '',
  puesto: '',
  salarioMensual: '',
  idNomina: '',
  estado: 'ACTIVO',
}

// ── Sub-componente: Dialog Nuevo / Editar Empleado ───────────────────────────
function EmpleadoDialog({ trigger, titulo = 'Nuevo Empleado', empleadoInicial = null, onGuardar, saving }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [formError, setFormError] = useState(null)

  function handleOpen(val) {
    setOpen(val)
    if (val) {
      // Si es edición, pre-llenamos el form con el empleado
      setForm(
        empleadoInicial
          ? {
              nombre: empleadoInicial.nombre ?? '',
              cedula: empleadoInicial.cedula ?? '',
              departamento: empleadoInicial.departamento ?? '',
              puesto: empleadoInicial.puesto ?? '',
              salarioMensual: empleadoInicial.salarioMensual ?? '',
              idNomina: empleadoInicial.idNomina ?? '',
              estado: empleadoInicial.estado ?? 'ACTIVO',
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
    if (!form.nombre.trim() || !form.cedula.trim() || !form.salarioMensual) {
      setFormError('Nombre, cédula y salario son obligatorios.')
      return
    }

    const payload = {
      ...(empleadoInicial ? { id: empleadoInicial.id } : {}),
      nombre: form.nombre.trim(),
      cedula: form.cedula.trim(),
      departamento: form.departamento.trim() || null,
      puesto: form.puesto.trim() || null,
      salarioMensual: parseFloat(form.salarioMensual),
      idNomina: form.idNomina ? parseInt(form.idNomina) : null,
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
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl border border-grey-200 p-6 w-full max-w-lg flex flex-col gap-5 focus:outline-none"
          style={{ boxShadow: '0px 8px 32px 0px rgba(0,0,0,0.12)' }}
        >
          {/* ── Header ── */}
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-xl font-bold text-grey-700">{titulo}</Dialog.Title>
            <Dialog.Description className="text-sm text-grey-400">
              Completá los datos del empleado. Los campos marcados con * son obligatorios.
            </Dialog.Description>
          </div>

          <Separator.Root className="h-px bg-grey-200" />

          {/* ── Formulario ── */}
          <div className="flex flex-col gap-4">

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">Nombre completo *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)}
                placeholder="Ej: Nelson Diaz"
                className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            {/* Cédula + Estado */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">Cédula *</label>
                <input
                  type="text"
                  value={form.cedula}
                  onChange={(e) => set('cedula', e.target.value)}
                  placeholder="Ej: 001-1234567-8"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">Estado</label>
                <Select.Root value={form.estado} onValueChange={(v) => set('estado', v)}>
                  <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer">
                    <Select.Value />
                    <Select.Icon>
                      <ChevronDownIcon className="text-grey-400" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      className="bg-white border border-grey-200 rounded-lg overflow-hidden z-50"
                      style={{ boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.08)' }}
                      position="popper"
                      sideOffset={4}
                    >
                      <Select.Viewport className="p-1">
                        {[
                          { value: 'ACTIVO', label: 'Activo' },
                          { value: 'INACTIVO', label: 'Inactivo' },
                        ].map((opt) => (
                          <Select.Item
                            key={opt.value}
                            value={opt.value}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-grey-700 rounded cursor-pointer hover:bg-primary-100 hover:text-primary-500 focus:outline-none focus:bg-primary-100 focus:text-primary-500"
                          >
                            <Select.ItemIndicator>
                              <CheckIcon className="text-primary-400" />
                            </Select.ItemIndicator>
                            <Select.ItemText>{opt.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            </div>

            {/* Departamento + Puesto */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">Departamento</label>
                <input
                  type="text"
                  value={form.departamento}
                  onChange={(e) => set('departamento', e.target.value)}
                  placeholder="Ej: Tecnología"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">Puesto</label>
                <input
                  type="text"
                  value={form.puesto}
                  onChange={(e) => set('puesto', e.target.value)}
                  placeholder="Ej: Desarrollador"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
            </div>

            {/* Salario + ID Nómina */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">Salario Mensual *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salarioMensual}
                  onChange={(e) => set('salarioMensual', e.target.value)}
                  placeholder="Ej: 60000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">ID Nómina</label>
                <input
                  type="number"
                  min="0"
                  value={form.idNomina}
                  onChange={(e) => set('idNomina', e.target.value)}
                  placeholder="Ej: 1"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
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
        <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-grey-100 text-grey-400 hover:text-grey-600 transition-colors cursor-pointer">
          <TrashIcon />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <AlertDialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl border border-grey-200 p-6 w-full max-w-md flex flex-col gap-4 focus:outline-none"
          style={{ boxShadow: '0px 8px 32px 0px rgba(0,0,0,0.12)' }}
        >
          <AlertDialog.Title className="text-lg font-bold text-grey-700">
            ¿Eliminar empleado?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-grey-400">
            Estás por eliminar a <span className="font-semibold text-grey-700">{nombre}</span>. Esta acción no se puede deshacer.
          </AlertDialog.Description>
          <div className="flex items-center justify-end gap-3 pt-1">
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

// ── Sub-componente: Estado de carga ──────────────────────────────────────────
function LoadingRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <div key={i}>
      <div
        className="grid items-center px-5 py-4 animate-pulse"
        style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 0.7fr' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-grey-200 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-32 bg-grey-200 rounded" />
            <div className="h-2.5 w-24 bg-grey-200 rounded" />
          </div>
        </div>
        <div className="h-3 w-28 bg-grey-200 rounded" />
        <div className="h-3 w-20 bg-grey-200 rounded" />
        <div className="h-5 w-16 bg-grey-200 rounded-lg" />
        <div className="flex gap-1">
          <div className="w-8 h-8 bg-grey-200 rounded-lg" />
          <div className="w-8 h-8 bg-grey-200 rounded-lg" />
        </div>
      </div>
      {i < 4 && <Separator.Root className="h-px bg-grey-200 mx-5" />}
    </div>
  ))
}

// ── Página principal ──────────────────────────────────────────────────────────
function EmpleadosPage() {
  const { toast } = useToast()

  const {
    empleados,
    empleadosFiltrados,
    loading,
    error,
    busqueda,
    setBusqueda,
    filtroEstado,
    setFiltroEstado,
    pagina,
    setPagina,
    totalPaginas,
    totalEmpleados,
    rangoDesde,
    rangoHasta,
    crear,
    actualizar,
    eliminar,
    saving,
  } = useEmpleados()

  // ── Wrappers con toast ──
  async function handleCrear(payload) {
    await crear(payload)
    toast({ title: 'Empleado creado', description: `"${payload.nombre}" fue agregado correctamente.`, variant: 'success' })
  }
  async function handleActualizar(payload) {
    await actualizar(payload)
    toast({ title: 'Empleado actualizado', description: `"${payload.nombre}" fue modificado correctamente.`, variant: 'success' })
  }
  async function handleEliminar(id) {
    const item = empleados.find((e) => e.id === id)
    await eliminar(id)
    toast({ title: 'Empleado eliminado', description: `"${item?.nombre}" fue eliminado.`, variant: 'error' })
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Body ── */}
      <div className="flex flex-col gap-6 px-8 pt-4 pb-8">

        {/* ── Título + breadcrumbs ── */}
        <div className="flex flex-col gap-1 pt-10">
          <h1 className="m-0 text-3xl font-bold text-grey-700">Empleados</h1>
          <nav className="flex items-center gap-1 text-sm">
            <span className="text-grey-400">Dashboard</span>
            <span className="text-grey-400">/</span>
            <span className="font-medium text-grey-700">Empleados</span>
          </nav>
        </div>

        {/* ── Error global de carga ── */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* ── Tabla ── */}
        <div
          className="bg-white rounded-xl border border-grey-200 overflow-hidden"
          style={{ boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.04)' }}
        >

          {/* ── Toolbar ── */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-grey-200">

            {/* Buscador */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-grey-200 bg-white focus-within:border-primary-400 transition-colors">
              <MagnifyingGlassIcon className="text-grey-300 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, cédula, puesto..."
                className="flex-1 text-sm bg-transparent text-grey-700 placeholder:text-grey-300 focus:outline-none"
              />
            </div>

            {/* Filtro estado */}
            <Select.Root value={filtroEstado} onValueChange={setFiltroEstado}>
              <Select.Trigger className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-grey-200 bg-white text-grey-500 hover:border-primary-300 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer min-w-36">
                <Select.Value />
                <Select.Icon className="ml-auto">
                  <ChevronDownIcon className="text-grey-400" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="bg-white border border-grey-200 rounded-xl overflow-hidden z-50"
                  style={{ boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.08)' }}
                  position="popper"
                  sideOffset={4}
                >
                  <Select.Viewport className="p-1">
                    {[
                      { value: 'todos',    label: 'Todos' },
                      { value: 'ACTIVO',   label: 'Activo' },
                      { value: 'INACTIVO', label: 'Inactivo' },
                    ].map((opt) => (
                      <Select.Item
                        key={opt.value}
                        value={opt.value}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-grey-700 rounded cursor-pointer hover:bg-primary-100 hover:text-primary-500 focus:outline-none focus:bg-primary-100 focus:text-primary-500"
                      >
                        <Select.ItemIndicator>
                          <CheckIcon className="text-primary-400 w-3 h-3" />
                        </Select.ItemIndicator>
                        <Select.ItemText>{opt.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>

            {/* Botón nuevo empleado */}
            <EmpleadoDialog
              titulo="Nuevo Empleado"
              onGuardar={handleCrear}
              saving={saving}
              trigger={
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-400 rounded-xl hover:bg-primary-500 transition-colors cursor-pointer shrink-0"
                  style={{ boxShadow: '0px 2px 8px 0px rgba(0,128,128,0.20)' }}
                >
                  <PlusIcon />
                  Nuevo Empleado
                </button>
              }
            />
          </div>

          {/* ── Cabecera de columnas ── */}
          <div
            className="grid items-center px-5 py-3 bg-grey-100 border-b border-grey-200"
            style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 0.7fr' }}
          >
            {['Empleado', 'Cédula', 'Salario Mensual', 'Estado', 'Acciones'].map((col) => (
              <span key={col} className="text-xs font-semibold text-grey-400 uppercase tracking-wide">
                {col}
              </span>
            ))}
          </div>

          {/* ── Filas ── */}
          {loading ? (
            <LoadingRows />
          ) : empleados.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-grey-400">
              <span className="text-sm font-medium">
                {busqueda || filtroEstado !== 'todos'
                  ? 'No se encontraron empleados con esos filtros.'
                  : 'No hay empleados registrados aún.'}
              </span>
            </div>
          ) : (
            empleados.map((emp, idx) => (
              <div key={emp.id}>
                <div
                  className="grid items-center px-5 py-3 hover:bg-grey-100 transition-colors"
                  style={{ gridTemplateColumns: '2fr 1.2fr 1fr 1fr 0.7fr' }}
                >
                  {/* Empleado: avatar + nombre + puesto */}
                  <div className="flex items-center gap-3">
                    <Avatar nombre={emp.nombre} />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-grey-700">{emp.nombre}</span>
                      <span className="text-xs text-grey-400">{emp.puesto ?? emp.departamento ?? '—'}</span>
                    </div>
                  </div>

                  {/* Cédula */}
                  <span className="text-sm text-grey-500">{emp.cedula}</span>

                  {/* Salario */}
                  <span className="text-sm font-semibold text-grey-700">{formatSalario(emp.salarioMensual)}</span>

                  {/* Estado */}
                  <EstadoBadge estado={emp.estado} />

                  {/* Acciones */}
                  <div className="flex items-center gap-1">
                    <Tooltip.Provider delayDuration={300}>
                      {/* Editar */}
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <EmpleadoDialog
                            titulo={`Editar — ${emp.nombre}`}
                            empleadoInicial={emp}
                            onGuardar={handleActualizar}
                            saving={saving}
                            trigger={
                              <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-primary-100 text-grey-400 hover:text-primary-500 transition-colors cursor-pointer">
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
                              nombre={emp.nombre}
                              onEliminar={() => handleEliminar(emp.id)}
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
                    </Tooltip.Provider>
                  </div>
                </div>

                {idx < empleados.length - 1 && (
                  <Separator.Root className="h-px bg-grey-200 mx-5" />
                )}
              </div>
            ))
          )}

          {/* ── Footer: paginación ── */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-grey-200">
            <span className="text-xs text-grey-400">
              {totalEmpleados === 0
                ? 'Sin resultados'
                : <>
                    Mostrando{' '}
                    <span className="font-semibold text-grey-700">{rangoDesde}–{rangoHasta}</span>
                    {' '}de{' '}
                    <span className="font-semibold text-grey-700">{totalEmpleados}</span>
                    {' '}empleados
                  </>
              }
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina(Math.max(1, pagina - 1))}
                disabled={pagina === 1}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-grey-200 text-grey-400 hover:bg-grey-100 hover:text-grey-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon />
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    p === pagina
                      ? 'bg-primary-400 text-white'
                      : 'border border-grey-200 text-grey-500 hover:bg-grey-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPagina(Math.min(totalPaginas, pagina + 1))}
                disabled={pagina === totalPaginas}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-grey-200 text-grey-400 hover:bg-grey-100 hover:text-grey-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>

        {/* ── Exportar ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExportarPDF(empleadosFiltrados)}
            disabled={loading || empleadosFiltrados.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-grey-600 rounded-xl border border-grey-200 hover:bg-grey-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileTextIcon className="text-grey-500" />
            Exportar en PDF
          </button>
          <button
            onClick={() => handleExportarXLSX(empleadosFiltrados)}
            disabled={loading || empleadosFiltrados.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-500 rounded-xl border border-primary-300 hover:bg-primary-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <DownloadIcon className="text-primary-400" />
            Exportar en XLS
          </button>
        </div>

      </div>
    </div>
  )
}

export default EmpleadosPage