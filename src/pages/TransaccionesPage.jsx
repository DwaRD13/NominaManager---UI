import { useState, useEffect } from 'react'
import { Dialog, Select, Separator, AlertDialog } from 'radix-ui'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FileTextIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
  UpdateIcon,
  Pencil1Icon,
  TrashIcon,
} from '@radix-ui/react-icons'
import { useTransacciones } from '../hooks/useTransacciones.js'
import { useToast } from '../hooks/useToast.jsx'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Formatea un número como moneda en pesos dominicanos */
function formatMonto(valor) {
  if (valor == null) return '—'
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

/** Formatea fecha: "25 Feb" */
function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  // Splitear YYYY-MM-DD y crear fecha local para evitar problemas de timezone
  const [year, month, day] = fechaStr.split('-').map(Number)
  const fecha = new Date(year, month - 1, day)
  const mes = fecha.toLocaleDateString('es-ES', { month: 'short' })
  const dia = fecha.getDate()
  return `${dia} ${mes.charAt(0).toUpperCase() + mes.slice(1)}`
}

// ── Estado inicial del formulario ─────────────────────────────────────────────
const FORM_VACIO = {
  idEmpleado: '',
  categoria: 'INGRESO', // 'INGRESO' o 'DEDUCCIÓN'
  tipoId: '',
  monto: '',
  fecha: new Date().toISOString().split('T')[0], // YYYY-MM-DD
}

// ── Sub-componente: Dialog de Transacción (crear/editar) ───────────────────
function TransaccionDialog({ trigger, onGuardar, saving, empleados, tiposIngresos, tiposDeducciones, transaccion }) {
  const isEdit = !!transaccion
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [formError, setFormError] = useState(null)

  // Abrir automáticamente si es edición
  useEffect(() => {
    if (transaccion) {
      const tipoId = transaccion.estado === 'INGRESO' 
        ? transaccion.tipoDeIngreso?.id 
        : transaccion.tipoDeDeduccion?.id
      setForm({
        idEmpleado: transaccion.empleado?.id?.toString() || '',
        categoria: transaccion.estado,
        tipoId: tipoId?.toString() || '',
        monto: transaccion.monto?.toString() || '',
        fecha: transaccion.fecha,
      })
      setOpen(true)
    }
  }, [transaccion])

  function handleOpen(val) {
    setOpen(val)
    if (!val && isEdit) {
      // Limpiar cuando se cierra en modo edición
      setForm(FORM_VACIO)
    }
    if (val && !transaccion) {
      setForm(FORM_VACIO)
    }
    setFormError(null)
  }

  function set(campo, valor) {
    setForm((prev) => {
      const newForm = { ...prev, [campo]: valor }
      // Reset tipoId when categoria changes
      if (campo === 'categoria') {
        newForm.tipoId = ''
        newForm.monto = ''
      }
      // Reset monto when tipo changes (se recalcula si depende del salario)
      if (campo === 'tipoId') {
        newForm.monto = ''
      }
      return newForm
    })
  }

  async function handleGuardar() {
    if (!form.idEmpleado) {
      setFormError('Debes seleccionar un empleado.')
      return
    }
    if (!form.tipoId) {
      setFormError('Debes seleccionar un tipo de transacción.')
      return
    }
    if (!form.fecha) {
      setFormError('Debes seleccionar una fecha.')
      return
    }

    // Find the tipo selected to get its nombre y si depende del salario
    const tipos = form.categoria === 'INGRESO' ? tiposIngresos : tiposDeducciones
    const tipoSeleccionado = tipos.find(t => t.id?.toString() === form.tipoId?.toString())

    // Validar monto solo si NO depende del salario
    if (!tipoSeleccionado?.dependeDeSalario) {
      if (!form.monto || parseFloat(form.monto) <= 0) {
        setFormError('El monto debe ser mayor a 0.')
        return
      }
    }

    // Construir payload según lo que espera el backend
    const payload = {
      ...(isEdit && { id: transaccion.id }), // Incluir ID si es edición
      empleadoId: parseInt(form.idEmpleado),
      fecha: form.fecha, // formato YYYY-MM-DD tal cual
      monto: tipoSeleccionado?.dependeDeSalario ? null : parseFloat(form.monto),
      // Enviar el tipo de ID correspondiente según la categoría
      ...(form.categoria === 'INGRESO' 
        ? { tipoDeIngresoId: parseInt(form.tipoId) }
        : { tipoDeDeduccionId: parseInt(form.tipoId) }
      ),
    }

    try {
      setFormError(null)
      await onGuardar(payload)
      setOpen(false)
    } catch (e) {
      setFormError(e.message)
    }
  }

  // Get tipos based on current category
  const tiposActuales = form.categoria === 'INGRESO' ? tiposIngresos : tiposDeducciones

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
            <Dialog.Title className="text-xl font-bold text-grey-700">
              {isEdit ? 'Editar Transacción' : 'Nueva Transacción'}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-grey-400">
              {isEdit 
                ? 'Modifica los datos de la transacción.' 
                : 'Registra un nuevo ingreso o deducción para un empleado.'}
            </Dialog.Description>
          </div>

          <Separator.Root className="h-px bg-grey-200" />

          {/* ── Formulario ── */}
          <div className="flex flex-col gap-4">

            {/* Empleado */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">Empleado *</label>
              <Select.Root value={form.idEmpleado} onValueChange={(v) => set('idEmpleado', v)}>
                <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer">
                  <Select.Value placeholder="Seleccionar empleado" />
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
                    <Select.Viewport className="p-1 max-h-60 overflow-y-auto">
                      {empleados.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-grey-400">No hay empleados activos</div>
                      ) : (
                        empleados.map((emp) => (
                          <Select.Item
                            key={emp.id}
                            value={emp.id.toString()}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-grey-700 rounded cursor-pointer hover:bg-primary-100 hover:text-primary-500 focus:outline-none focus:bg-primary-100 focus:text-primary-500"
                          >
                            <Select.ItemIndicator>
                              <CheckIcon className="text-primary-400 w-3 h-3" />
                            </Select.ItemIndicator>
                            <Select.ItemText>{emp.nombre}</Select.ItemText>
                          </Select.Item>
                        ))
                      )}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Categoría (Ingreso/Deducción) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">Tipo de transacción *</label>
              <Select.Root value={form.categoria} onValueChange={(v) => set('categoria', v)}>
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
                      <Select.Item
                        value="INGRESO"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-grey-700 rounded cursor-pointer hover:bg-primary-100 hover:text-primary-500 focus:outline-none focus:bg-primary-100 focus:text-primary-500"
                      >
                        <Select.ItemIndicator>
                          <CheckIcon className="text-primary-400 w-3 h-3" />
                        </Select.ItemIndicator>
                        <Select.ItemText>Ingreso</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="DEDUCCIÓN"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-grey-700 rounded cursor-pointer hover:bg-primary-100 hover:text-primary-500 focus:outline-none focus:bg-primary-100 focus:text-primary-500"
                      >
                        <Select.ItemIndicator>
                          <CheckIcon className="text-primary-400 w-3 h-3" />
                        </Select.ItemIndicator>
                        <Select.ItemText>Deducción</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Tipo específico (según categoría) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">
                {form.categoria === 'INGRESO' ? 'Tipo de ingreso *' : 'Tipo de deducción *'}
              </label>
              <Select.Root value={form.tipoId} onValueChange={(v) => set('tipoId', v)}>
                <Select.Trigger 
                  disabled={tiposActuales.length === 0}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer disabled:bg-grey-100 disabled:text-grey-400"
                >
                  <Select.Value placeholder={form.categoria === 'INGRESO' ? 'Seleccionar ingreso' : 'Seleccionar deducción'} />
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
                    <Select.Viewport className="p-1 max-h-60 overflow-y-auto">
                      {tiposActuales.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-grey-400">
                          No hay tipos de {form.categoria === 'INGRESO' ? 'ingreso' : 'deducción'} disponibles
                        </div>
                      ) : (
                        tiposActuales.map((tipo) => (
                          <Select.Item
                            key={tipo.id}
                            value={tipo.id.toString()}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-grey-700 rounded cursor-pointer hover:bg-primary-100 hover:text-primary-500 focus:outline-none focus:bg-primary-100 focus:text-primary-500"
                          >
                            <Select.ItemIndicator>
                              <CheckIcon className="text-primary-400 w-3 h-3" />
                            </Select.ItemIndicator>
                            <Select.ItemText>{tipo.nombre}</Select.ItemText>
                          </Select.Item>
                        ))
                      )}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Fecha */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">Fecha *</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => set('fecha', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer"
              />
            </div>

            {/* Monto - solo se muestra si el tipo NO depende del salario */}
            {(() => {
              const tipoSeleccionado = tiposActuales.find(t => t.id?.toString() === form.tipoId?.toString())
              const dependeDelSalario = tipoSeleccionado?.dependeDeSalario === true
              
              return !dependeDelSalario ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-grey-600">Monto *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-400 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.monto}
                      onChange={(e) => set('monto', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-grey-100 border border-grey-200">
                  <span className="text-xs font-medium text-grey-400">
                    Este tipo se calcula automáticamente según el salario del empleado
                  </span>
                </div>
              )
            })()}

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

// ── Sub-componente: Badge de tipo ──────────────────────────────────────────
function TipoBadge({ estado }) {
  const isIngreso = estado?.toUpperCase() === 'INGRESO'
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold w-fit ${
        isIngreso
          ? 'bg-green-100 text-green-600'
          : 'bg-red-100 text-red-600'
      }`}
    >
      {estado ?? '—'}
    </span>
  )
}

// ── Sub-componente: Monto con signo ─────────────────────────────────────────
function MontoDisplay({ monto, estado }) {
  const isIngreso = estado?.toUpperCase() === 'INGRESO'
  const prefix = isIngreso ? '+' : '-'
  return (
    <span className={`text-sm font-semibold ${isIngreso ? 'text-green-600' : 'text-red-600'}`}>
      {prefix}{formatMonto(monto)}
    </span>
  )
}

// ── Sub-componente: Estado de carga ──────────────────────────────────────────
function LoadingRows() {
  return Array.from({ length: 8 }).map((_, i) => (
    <div key={i}>
      <div
        className="grid items-center px-5 py-4 animate-pulse"
        style={{ gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 0.8fr' }}
      >
        <div className="h-4 w-16 bg-grey-200 rounded" />
        <div className="h-4 w-32 bg-grey-200 rounded" />
        <div className="h-4 w-32 bg-grey-200 rounded" />
        <div className="h-4 w-24 bg-grey-200 rounded" />
        <div className="h-6 w-20 bg-grey-200 rounded-lg" />
      </div>
      {i < 7 && <Separator.Root className="h-px bg-grey-200 mx-5" />}
    </div>
  ))
}

// ── Página principal ──────────────────────────────────────────────────────────
function TransaccionesPage() {
  const { toast } = useToast()
  
  const {
    transacciones,
    transaccionesFiltradas,
    loading,
    error,
    busqueda,
    setBusqueda,
    filtroTipo,
    setFiltroTipo,
    pagina,
    setPagina,
    totalPaginas,
    totalTransacciones,
    rangoDesde,
    rangoHasta,
    saving,
    empleados,
    tiposIngresos,
    tiposDeducciones,
    crear,
    actualizar,
    eliminar,
  } = useTransacciones()

  // ── Exportación ──
  async function handleExportarPDF() {
    if (transaccionesFiltradas.length === 0) {
      window.alert('No hay datos para exportar.')
      return
    }

    try {
      const { exportarTransaccionesPDF } = await import('../lib/exportar.js')
      exportarTransaccionesPDF(transaccionesFiltradas, {
        busqueda,
        filtroTipo,
      })
    } catch (e) {
      console.error(e)
      window.alert('Ocurrió un error exportando el PDF.')
    }
  }

  async function handleExportarXLSX() {
    if (transaccionesFiltradas.length === 0) {
      window.alert('No hay datos para exportar.')
      return
    }

    try {
      const { exportarTransaccionesXLSX } = await import('../lib/exportar.js')
      exportarTransaccionesXLSX(transaccionesFiltradas, {
        busqueda,
        filtroTipo,
      })
    } catch (e) {
      console.error(e)
      window.alert('Ocurrió un error exportando el XLSX.')
    }
  }

  // ── Estado para edición y eliminación ──
  const [transaccionEditando, setTransaccionEditando] = useState(null)
  const [transaccionEliminando, setTransaccionEliminando] = useState(null)

  // ── Wrapper con toast para crear ──
  async function handleCrear(payload) {
    await crear(payload)
    const montoMsg = payload.monto == null 
      ? 'calculado según salario' 
      : formatMonto(payload.monto)
    toast({ 
      title: 'Transacción creada', 
      description: `Se registró ${payload.tipoDeIngresoId ? 'un ingreso' : 'una deducción'} de ${montoMsg}`, 
      variant: 'success' 
    })
  }

  // ── Wrapper con toast para actualizar ──
  async function handleActualizar(payload) {
    await actualizar(payload)
    // Determinar tipo de transacción para el mensaje
    const esIngreso = payload.tipoDeIngresoId != null
    toast({ 
      title: 'Transacción actualizada', 
      description: `Se actualizó ${esIngreso ? 'el ingreso' : 'la deducción'} correctamente.`, 
      variant: 'success' 
    })
    setTransaccionEditando(null)
  }

  // ── Wrapper con toast para eliminar ──
  async function handleEliminar() {
    await eliminar(transaccionEliminando.id)
    toast({ 
      title: 'Transacción eliminada', 
      description: `Se eliminó ${transaccionEliminando.estado === 'INGRESO' ? 'el ingreso' : 'la deducción'} de ${transaccionEliminando.nombreEmpleado}`, 
      variant: 'success' 
    })
    setTransaccionEliminando(null)
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Body ── */}
      <div className="flex flex-col gap-6 px-8 pt-4 pb-8">

        {/* ── Título + breadcrumbs ── */}
        <div className="flex flex-col gap-1 pt-10">
          <h1 className="m-0 text-3xl font-bold text-grey-700">Transacciones</h1>
          <nav className="flex items-center gap-1 text-sm">
            <span className="text-grey-400">Dashboard</span>
            <span className="text-grey-400">/</span>
            <span className="font-medium text-grey-700">Transacciones</span>
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
                placeholder="Buscar por nombre, tipo..."
                className="flex-1 text-sm bg-transparent text-grey-700 placeholder:text-grey-300 focus:outline-none"
              />
            </div>

            {/* Filtro tipo */}
            <Select.Root value={filtroTipo} onValueChange={setFiltroTipo}>
              <Select.Trigger className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-grey-200 bg-white text-grey-500 hover:border-primary-300 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer min-w-36">
                <Select.Value placeholder="Todas" />
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
                      { value: 'todos', label: 'Todas' },
                      { value: 'INGRESO', label: 'Ingresos' },
                      { value: 'DEDUCCIÓN', label: 'Deducciones' },
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

            {/* Botón nueva transacción */}
            <TransaccionDialog
              onGuardar={handleCrear}
              saving={saving}
              empleados={empleados}
              tiposIngresos={tiposIngresos}
              tiposDeducciones={tiposDeducciones}
              trigger={
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-400 rounded-xl hover:bg-primary-500 transition-colors cursor-pointer shrink-0"
                  style={{ boxShadow: '0px 2px 8px 0px rgba(0,128,128,0.20)' }}
                >
                  <PlusIcon />
                  Nueva Transacción
                </button>
              }
            />
          </div>

          {/* ── Cabecera de columnas ── */}
          <div
            className="grid items-center px-5 py-3 bg-grey-100 border-b border-grey-200"
            style={{ gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 0.8fr 0.5fr' }}
          >
            {['Fecha', 'Tipo', 'Empleado', 'Monto', 'Estado', ''].map((col) => (
              <span key={col} className="text-xs font-semibold text-grey-400 uppercase tracking-wide">
                {col}
              </span>
            ))}
          </div>

          {/* ── Filas ── */}
          {loading ? (
            <LoadingRows />
          ) : transacciones.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-grey-400">
              <span className="text-sm font-medium">
                {busqueda || filtroTipo !== 'todos'
                  ? 'No se encontraron transacciones con esos filtros.'
                  : 'No hay transacciones registradas aún.'}
              </span>
            </div>
          ) : (
            transacciones.map((t, idx) => (
              <div key={t.id}>
                <div
                  className="grid items-center px-5 py-3 hover:bg-grey-100 transition-colors"
                  style={{ gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 0.8fr 0.5fr' }}
                >
                  {/* Fecha */}
                  <span className="text-sm text-grey-600">{formatFecha(t.fecha)}</span>

                  {/* Tipo */}
                  <span className="text-sm font-semibold text-grey-700">{t.tipo}</span>

                  {/* Empleado */}
                  <span className="text-sm text-grey-600">{t.nombreEmpleado}</span>

                  {/* Monto */}
                  <MontoDisplay monto={t.monto} estado={t.estado} />

                  {/* Estado */}
                  <TipoBadge estado={t.estado} />

                  {/* Acciones */}
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => setTransaccionEditando(t)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-grey-400 hover:bg-primary-100 hover:text-primary-500 transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Pencil1Icon />
                    </button>
                    <button
                      onClick={() => setTransaccionEliminando(t)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-grey-400 hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                {idx < transacciones.length - 1 && (
                  <Separator.Root className="h-px bg-grey-200 mx-5" />
                )}
              </div>
            ))
          )}

          {/* ── Footer: paginación ── */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-grey-200">
            <span className="text-xs text-grey-400">
              {totalTransacciones === 0
                ? 'Sin resultados'
                : <>
                    Mostrando{' '}
                    <span className="font-semibold text-grey-700">{rangoDesde}–{rangoHasta}</span>
                    {' '}de{' '}
                    <span className="font-semibold text-grey-700">{totalTransacciones}</span>
                    {' '}transacciones
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
            onClick={handleExportarPDF}
            disabled={loading || transaccionesFiltradas.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-grey-600 rounded-xl border border-grey-200 hover:bg-grey-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileTextIcon className="text-grey-500" />
            Exportar en PDF
          </button>

          <button
            onClick={handleExportarXLSX}
            disabled={loading || transaccionesFiltradas.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-500 rounded-xl border border-primary-300 hover:bg-primary-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <DownloadIcon className="text-primary-400" />
            Exportar en XLS
          </button>
        </div>

        {/* ── Dialog de edición ── */}
        {transaccionEditando && (
          <TransaccionDialog
            transaccion={transaccionEditando}
            onGuardar={handleActualizar}
            saving={saving}
            empleados={empleados}
            tiposIngresos={tiposIngresos}
            tiposDeducciones={tiposDeducciones}
            trigger={null}
          />
        )}

        {/* ── AlertDialog de eliminación ── */}
        <AlertDialog.Root open={!!transaccionEliminando} onOpenChange={(open) => !open && setTransaccionEliminando(null)}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
            <AlertDialog.Content
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl border border-grey-200 p-6 w-full max-w-md flex flex-col gap-5 focus:outline-none"
              style={{ boxShadow: '0px 8px 32px 0px rgba(0,0,0,0.12)' }}
            >
              <AlertDialog.Title className="text-xl font-bold text-grey-700">
                Eliminar Transacción
              </AlertDialog.Title>
              <AlertDialog.Description className="text-sm text-grey-500">
                ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
              </AlertDialog.Description>
              <div className="flex items-center justify-end gap-3">
                <AlertDialog.Cancel asChild>
                  <button
                    className="px-4 py-2 text-sm font-medium text-grey-500 rounded-lg border border-grey-200 hover:bg-grey-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <button
                    onClick={handleEliminar}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {saving && <UpdateIcon className="animate-spin mr-2" />}
                    Eliminar
                  </button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

      </div>
    </div>
  )
}

export default TransaccionesPage
