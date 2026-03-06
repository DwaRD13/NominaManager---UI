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
} from '@radix-ui/react-icons'

// ── Datos mock ──
const empleados = [
  { id: 1, iniciales: 'ND', nombre: 'Nelson Diaz',    cargo: 'Desarrollador Backend',   email: 'nelson@gmail.com',    salario: '$60,000.00', estado: 'ACTIVO' },
  { id: 2, iniciales: 'MG', nombre: 'María García',   cargo: 'Diseñadora UX',            email: 'maria@gmail.com',     salario: '$55,000.00', estado: 'ACTIVO' },
  { id: 3, iniciales: 'CA', nombre: 'Carlos Acosta',  cargo: 'Contador Senior',          email: 'carlos@gmail.com',    salario: '$70,000.00', estado: 'ACTIVO' },
  { id: 4, iniciales: 'LP', nombre: 'Laura Perez',    cargo: 'Analista de RRHH',         email: 'laura@gmail.com',     salario: '$48,000.00', estado: 'ACTIVO' },
  { id: 5, iniciales: 'JR', nombre: 'Juan Rodriguez', cargo: 'Desarrollador Frontend',   email: 'juan@gmail.com',      salario: '$62,000.00', estado: 'INACTIVO' },
  { id: 6, iniciales: 'SO', nombre: 'Sofía Ortiz',    cargo: 'Gerente de Proyectos',     email: 'sofia@gmail.com',     salario: '$85,000.00', estado: 'ACTIVO' },
  { id: 7, iniciales: 'RM', nombre: 'Roberto Molina', cargo: 'Soporte Técnico',          email: 'roberto@gmail.com',   salario: '$40,000.00', estado: 'ACTIVO' },
  { id: 8, iniciales: 'AL', nombre: 'Ana López',      cargo: 'Auditora Interna',         email: 'ana@gmail.com',       salario: '$67,000.00', estado: 'ACTIVO' },
]

// ── Sub-componente: Avatar de iniciales ──
function Avatar({ iniciales }) {
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-400 shrink-0">
      <span className="text-xs font-semibold text-white">{iniciales}</span>
    </div>
  )
}

// ── Sub-componente: Badge de estado ──
function EstadoBadge({ estado }) {
  const isActivo = estado === 'ACTIVO'
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold w-fit ${
        isActivo
          ? 'bg-primary-100 text-primary-500'
          : 'bg-grey-200 text-grey-500'
      }`}
    >
      {estado}
    </span>
  )
}

// ── Sub-componente: Dialog Nuevo / Editar Empleado ──
function EmpleadoDialog({ trigger, titulo = 'Nuevo Empleado' }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl border border-grey-200 p-6 w-full max-w-lg flex flex-col gap-5 focus:outline-none"
          style={{ boxShadow: '0px 8px 32px 0px rgba(0,0,0,0.12)' }}
        >
          {/* Header */}
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-xl font-bold text-grey-700">{titulo}</Dialog.Title>
            <Dialog.Description className="text-sm text-grey-400">
              Completá los datos del empleado. Los campos marcados con * son obligatorios.
            </Dialog.Description>
          </div>

          <Separator.Root className="h-px bg-grey-200" />

          {/* Formulario */}
          <div className="flex flex-col gap-4">

            {/* Nombre + Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">Nombre *</label>
                <input
                  type="text"
                  placeholder="Ej: Nelson"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">Apellido *</label>
                <input
                  type="text"
                  placeholder="Ej: Diaz"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">Email *</label>
              <input
                type="email"
                placeholder="Ej: nelson@gmail.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            {/* Cargo + Salario */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">Cargo *</label>
                <input
                  type="text"
                  placeholder="Ej: Desarrollador"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">Salario Mensual *</label>
                <input
                  type="text"
                  placeholder="Ej: 60000"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>
            </div>

            {/* Estado */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">Estado</label>
              <Select.Root defaultValue="activo">
                <Select.Trigger
                  className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer"
                >
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
                        value="activo"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-grey-700 rounded cursor-pointer hover:bg-primary-100 hover:text-primary-500 focus:outline-none focus:bg-primary-100 focus:text-primary-500"
                      >
                        <Select.ItemIndicator>
                          <CheckIcon className="text-primary-400" />
                        </Select.ItemIndicator>
                        <Select.ItemText>Activo</Select.ItemText>
                      </Select.Item>
                      <Select.Item
                        value="inactivo"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-grey-700 rounded cursor-pointer hover:bg-grey-100 focus:outline-none focus:bg-grey-100"
                      >
                        <Select.ItemIndicator>
                          <CheckIcon className="text-grey-500" />
                        </Select.ItemIndicator>
                        <Select.ItemText>Inactivo</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-grey-500 rounded-lg border border-grey-200 hover:bg-grey-100 transition-colors cursor-pointer">
                Cancelar
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary-400 rounded-lg hover:bg-primary-500 transition-colors cursor-pointer"
                style={{ boxShadow: '0px 2px 8px 0px rgba(0,128,128,0.20)' }}
              >
                Guardar
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── Sub-componente: AlertDialog Eliminar ──
function EliminarDialog({ nombre }) {
  return (
    <AlertDialog.Root>
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
              <button className="px-4 py-2 text-sm font-medium text-grey-500 rounded-lg border border-grey-200 hover:bg-grey-100 transition-colors cursor-pointer">
                Cancelar
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button className="px-4 py-2 text-sm font-medium text-white bg-grey-600 rounded-lg hover:bg-grey-700 transition-colors cursor-pointer">
                Sí, eliminar
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

// ── Página principal ──
function EmpleadosPage() {
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
                placeholder="Buscar empleado..."
                className="flex-1 text-sm bg-transparent text-grey-700 placeholder:text-grey-300 focus:outline-none"
              />
            </div>

            {/* Filtro estado — Select Radix */}
            <Select.Root defaultValue="todos">
              <Select.Trigger
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-grey-200 bg-white text-grey-500 hover:border-primary-300 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer min-w-36"
              >
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
                      { value: 'activo',   label: 'Activo' },
                      { value: 'inactivo', label: 'Inactivo' },
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

            {/* Botón nuevo empleado — abre Dialog */}
            <EmpleadoDialog
              titulo="Nuevo Empleado"
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
            style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 0.7fr' }}
          >
            {['Empleado', 'Email', 'Salario Mensual', 'Estado', 'Acciones'].map((col) => (
              <span key={col} className="text-xs font-semibold text-grey-400 uppercase tracking-wide">
                {col}
              </span>
            ))}
          </div>

          {/* ── Filas ── */}
          {empleados.map((emp, idx) => (
            <div key={emp.id}>
              <div
                className="grid items-center px-5 py-3 hover:bg-grey-100 transition-colors"
                style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 0.7fr' }}
              >
                {/* Empleado: avatar + nombre + cargo */}
                <div className="flex items-center gap-3">
                  <Avatar iniciales={emp.iniciales} />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-grey-700">{emp.nombre}</span>
                    <span className="text-xs text-grey-400">{emp.cargo}</span>
                  </div>
                </div>

                {/* Email */}
                <span className="text-sm text-grey-500">{emp.email}</span>

                {/* Salario */}
                <span className="text-sm font-semibold text-grey-700">{emp.salario}</span>

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
                          <EliminarDialog nombre={emp.nombre} />
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
          ))}

          {/* ── Footer: paginación ── */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-grey-200">
            <span className="text-xs text-grey-400">
              Mostrando <span className="font-semibold text-grey-700">1–8</span> de <span className="font-semibold text-grey-700">25</span> empleados
            </span>
            <div className="flex items-center gap-1">
              <button className="flex items-center justify-center w-8 h-8 rounded-lg border border-grey-200 text-grey-400 hover:bg-grey-100 hover:text-grey-700 transition-colors cursor-pointer">
                <ChevronLeftIcon />
              </button>
              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    page === 1
                      ? 'bg-primary-400 text-white'
                      : 'border border-grey-200 text-grey-500 hover:bg-grey-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="flex items-center justify-center w-8 h-8 rounded-lg border border-grey-200 text-grey-400 hover:bg-grey-100 hover:text-grey-700 transition-colors cursor-pointer">
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>

        {/* ── Exportar ── */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-grey-600 rounded-xl border border-grey-200 hover:bg-grey-100 transition-colors cursor-pointer">
            <FileTextIcon className="text-grey-500" />
            Exportar en PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-500 rounded-xl border border-primary-300 hover:bg-primary-100 transition-colors cursor-pointer">
            <DownloadIcon className="text-primary-400" />
            Exportar en XLS
          </button>
        </div>

      </div>
    </div>
  )
}

export default EmpleadosPage
