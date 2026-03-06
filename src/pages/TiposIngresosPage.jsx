import { Dialog, AlertDialog, Separator, Tooltip } from 'radix-ui'
import {
  PlusIcon,
  Pencil1Icon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FileTextIcon,
  DownloadIcon,
} from '@radix-ui/react-icons'

// ── Datos mock ──
const tiposIngresos = [
  { id: 1, nombre: 'Salario Base',            subtitulo: 'Gravable' },
  { id: 2, nombre: 'Bono de Desempeño',       subtitulo: 'Gravable' },
  { id: 3, nombre: 'Reembolso de Gastos',     subtitulo: 'No gravable' },
  { id: 4, nombre: 'Horas Extra',             subtitulo: 'Gravable' },
  { id: 5, nombre: 'Comisión de Ventas',      subtitulo: 'Gravable' },
]

const tiposDeducciones = [
  { id: 1, nombre: 'Seguro Familiar de Salud (SFS)', subtitulo: 'Tasa: 3.04%' },
  { id: 2, nombre: 'Fondo de Pensiones (AFP)',        subtitulo: 'Tasa: 2.87%' },
  { id: 3, nombre: 'Impuesto sobre la Renta (ISR)',   subtitulo: 'Tasa: Variable' },
  { id: 4, nombre: 'Seguro de Riesgos Laborales',     subtitulo: 'Tasa: 1.20%' },
  { id: 5, nombre: 'Préstamo Empresarial',             subtitulo: 'Monto fijo' },
]

// ── Sub-componente: Dialog para crear / editar un tipo ──
function TipoDialog({ trigger, titulo, labelNombre, labelSub, placeholderSub }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl border border-grey-200 p-6 w-full max-w-md flex flex-col gap-5 focus:outline-none"
          style={{ boxShadow: '0px 8px 32px 0px rgba(0,0,0,0.12)' }}
        >
          {/* Header */}
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-lg font-bold text-grey-700">{titulo}</Dialog.Title>
            <Dialog.Description className="text-sm text-grey-400">
              Completá los campos. Los marcados con * son obligatorios.
            </Dialog.Description>
          </div>

          <Separator.Root className="h-px bg-grey-200" />

          {/* Campos */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">{labelNombre} *</label>
              <input
                type="text"
                placeholder={`Ej: ${labelNombre}`}
                className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">{labelSub}</label>
              <input
                type="text"
                placeholder={placeholderSub}
                className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
              />
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

// ── Sub-componente: AlertDialog para eliminar ──
function EliminarDialog({ nombre }) {
  return (
    <AlertDialog.Root>
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
            ¿Eliminar tipo?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-grey-400">
            Estás por eliminar <span className="font-semibold text-grey-700">"{nombre}"</span>. Esta acción no se puede deshacer.
          </AlertDialog.Description>
          <div className="flex items-center justify-end gap-3">
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

// ── Sub-componente: Paginación reutilizable ──
function Paginacion({ total, pagina = 1, paginas = 4 }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-grey-200">
      <span className="text-xs text-grey-400">
        <span className="font-semibold text-grey-700">{total}</span> tipos registrados
      </span>
      <div className="flex items-center gap-1">
        <button className="flex items-center justify-center w-7 h-7 rounded-lg border border-grey-200 text-grey-400 hover:bg-grey-100 transition-colors cursor-pointer">
          <ChevronLeftIcon />
        </button>
        {Array.from({ length: paginas }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              p === pagina
                ? 'bg-primary-400 text-white'
                : 'border border-grey-200 text-grey-500 hover:bg-grey-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button className="flex items-center justify-center w-7 h-7 rounded-lg border border-grey-200 text-grey-400 hover:bg-grey-100 transition-colors cursor-pointer">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  )
}

// ── Sub-componente: Fila de item ──
function ItemRow({ item, labelNombre, labelSub, placeholderSub, isLast }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 hover:bg-grey-100 transition-colors">
        {/* Info */}
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-grey-700">{item.nombre}</span>
          <span className="text-xs text-grey-400">{item.subtitulo}</span>
        </div>

        {/* Acciones */}
        <Tooltip.Provider delayDuration={300}>
          <div className="flex items-center gap-1">
            {/* Editar */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <TipoDialog
                  titulo={`Editar — ${item.nombre}`}
                  labelNombre={labelNombre}
                  labelSub={labelSub}
                  placeholderSub={placeholderSub}
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
                  <EliminarDialog nombre={item.nombre} />
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

// ── Página principal ──
function TiposIngresosPage() {
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

        {/* ── Dos columnas: Ingresos | Deducciones ── */}
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
                <h2 className="text-base font-bold text-grey-700">Tipos de Ingresos</h2>
              </div>
              <TipoDialog
                titulo="Nuevo Tipo de Ingreso"
                labelNombre="Nombre"
                labelSub="Condición fiscal"
                placeholderSub="Ej: Gravable"
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

            {/* Lista */}
            {tiposIngresos.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                labelNombre="Nombre del ingreso"
                labelSub="Condición fiscal"
                placeholderSub="Ej: Gravable"
                isLast={idx === tiposIngresos.length - 1}
              />
            ))}

            {/* Footer + Paginación */}
            <Paginacion total={tiposIngresos.length} pagina={1} paginas={3} />
          </div>

          {/* ════════════════════════════
              COLUMNA DERECHA — DEDUCCIONES
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
                <h2 className="text-base font-bold text-grey-700">Tipos de Deducciones</h2>
              </div>
              <TipoDialog
                titulo="Nueva Deducción"
                labelNombre="Nombre"
                labelSub="Tasa o monto"
                placeholderSub="Ej: 3.04% o Monto fijo"
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

            {/* Lista */}
            {tiposDeducciones.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                labelNombre="Nombre de la deducción"
                labelSub="Tasa o monto"
                placeholderSub="Ej: 3.04% o Monto fijo"
                isLast={idx === tiposDeducciones.length - 1}
              />
            ))}

            {/* Footer + Paginación */}
            <Paginacion total={tiposDeducciones.length} pagina={1} paginas={3} />
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

export default TiposIngresosPage
