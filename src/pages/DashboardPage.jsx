import { Separator, Tooltip } from 'radix-ui'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PersonIcon,
  FileTextIcon,
  ArrowRightIcon,
  UpdateIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons'

// ── Datos de ejemplo (mock) ──
const statCards = [
  {
    id: 'ingresos',
    label: 'Tipos de Ingresos',
    sublabel: '13 Tipos registrados',
    icon: ArrowUpIcon,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-500',
  },
  {
    id: 'deducciones',
    label: 'Tipos Deducción',
    sublabel: '8 Tipos registrados',
    icon: ArrowDownIcon,
    iconBg: 'bg-grey-200',
    iconColor: 'text-grey-600',
  },
  {
    id: 'empleados',
    label: 'Empleados',
    sublabel: '25 Activos',
    icon: PersonIcon,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-500',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    sublabel: 'Generar Informes',
    icon: FileTextIcon,
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-500',
  },
]

const actividadReciente = [
  {
    id: 1,
    tipo: 'Salario Base',
    empleado: 'Nelson Diaz',
    fecha: '25 Apr',
    monto: '+$240,000.00',
    estado: 'INGRESO',
    montoColor: 'text-primary-400',
    badgeBg: 'bg-primary-100',
    badgeColor: 'text-primary-500',
  },
  {
    id: 2,
    tipo: 'Salario Base',
    empleado: 'Nelson Diaz',
    fecha: '25 Apr',
    monto: '+$240,000.00',
    estado: 'INGRESO',
    montoColor: 'text-primary-400',
    badgeBg: 'bg-primary-100',
    badgeColor: 'text-primary-500',
  },
  {
    id: 3,
    tipo: 'Salario Base',
    empleado: 'Nelson Diaz',
    fecha: '25 Apr',
    monto: '+$240,000.00',
    estado: 'INGRESO',
    montoColor: 'text-primary-400',
    badgeBg: 'bg-primary-100',
    badgeColor: 'text-primary-500',
  },
  {
    id: 4,
    tipo: 'Salario Base',
    empleado: 'Nelson Diaz',
    fecha: '25 Apr',
    monto: '+$240,000.00',
    estado: 'INGRESO',
    montoColor: 'text-primary-400',
    badgeBg: 'bg-primary-100',
    badgeColor: 'text-primary-500',
  },
  {
    id: 5,
    tipo: 'Salario Base',
    empleado: 'Nelson Diaz',
    fecha: '25 Apr',
    monto: '-$55,500.00',
    estado: 'DEDUCCIÓN',
    montoColor: 'text-grey-600',
    badgeBg: 'bg-grey-200',
    badgeColor: 'text-grey-600',
  },
]

function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Body ── */}
      <div className="flex flex-col gap-6 px-8 pt-4 pb-8">

        {/* ── Título + breadcrumbs ── */}
        <div className="flex flex-col gap-1 pt-10">
          <h1 className="m-0 text-3xl font-bold text-grey-700">Dashboard</h1>
          <nav className="flex items-center gap-1 text-sm">
            <span className="text-grey-400">Inicio</span>
          </nav>
        </div>

        {/* ── Fila superior: Card Nómina + Card Sincronización ── */}
        <div className="flex gap-5">

          {/* ── Card: Total Nómina Mensual ── */}
          <div
            className="flex-1 bg-white rounded-xl border border-grey-200 p-6 flex flex-col gap-4"
            style={{ boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.04)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-grey-700">Total Nómina Mensual</h2>
              <Tooltip.Provider delayDuration={300}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <span className="text-xs text-grey-400 cursor-default">Marzo 2026</span>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-grey-700 text-white text-xs px-2 py-1 rounded"
                      sideOffset={4}
                    >
                      Período activo
                      <Tooltip.Arrow className="fill-grey-700" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>

            {/* Monto principal */}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary-400">$</span>
              <span className="text-5xl font-bold text-grey-700">184,500.00</span>
            </div>

            {/* Separador */}
            <Separator.Root className="h-px bg-grey-200" />

            {/* Breakdown Ingresos / Deducciones */}
            <div className="flex items-center gap-8 bg-grey-100 rounded-lg px-4 py-3 border border-grey-200">
              <div className="flex items-center gap-3">
                <span className="text-grey-400 text-sm font-medium">Ingresos:</span>
                <span className="text-base font-bold text-primary-400">$240,000.00</span>
              </div>
              <Separator.Root orientation="vertical" className="w-px h-6 bg-grey-300" />
              <div className="flex items-center gap-3">
                <span className="text-grey-400 text-sm font-medium">Deducciones:</span>
                <span className="text-base font-bold text-grey-600">-$55,500.00</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 mt-auto">
              <PersonIcon className="text-primary-300" />
              <span className="text-sm text-grey-400">25 Empleados Activos</span>
            </div>
          </div>

          {/* ── Card: Sincronizar Contabilidad ── */}
          <div
            className="w-96 bg-white rounded-xl border border-grey-200 p-6 flex flex-col gap-4"
            style={{ boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.04)' }}
          >
            <h2 className="text-lg font-bold text-grey-700">Sincronizar Contabilidad</h2>

            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-grey-400">Última sincronización:</span>
                <span className="text-sm font-medium text-grey-700">20 Abril 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-grey-400">Estado:</span>
                <span className="text-sm font-medium text-secondary-300">Pendiente de envío</span>
              </div>
            </div>

            {/* Botón Enviar WS */}
            <button
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary-400 text-white text-sm font-medium transition-colors hover:bg-primary-500 cursor-pointer"
              style={{ boxShadow: '0px 2px 8px 0px rgba(0,128,128,0.20)' }}
            >
              <UpdateIcon />
              Enviar WS
            </button>
          </div>
        </div>

        {/* ── Fila de stat cards ── */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.id}
                className="bg-white rounded-xl border border-grey-200 p-4 flex items-center gap-4"
                style={{ boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.04)' }}
              >
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${card.iconBg}`}>
                  <Icon className={`w-7 h-7 ${card.iconColor}`} />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-grey-700">{card.label}</span>
                  <span className="text-xs text-grey-400">{card.sublabel}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Tabla: Actividad Reciente ── */}
        <div
          className="bg-white rounded-xl border border-grey-200 overflow-hidden"
          style={{ boxShadow: '0px 4px 16px 0px rgba(0,0,0,0.04)' }}
        >
          {/* Header tabla */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-grey-200">
            <h2 className="text-lg font-bold text-grey-700">Actividad Reciente</h2>
            <button className="flex items-center gap-1 text-sm text-primary-400 font-medium hover:text-primary-500 transition-colors cursor-pointer">
              Ver todas
              <ArrowRightIcon />
            </button>
          </div>

          {/* Encabezados de columna */}
          <div className="grid bg-grey-100 px-6 py-3 border-b border-grey-200" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}>
            {['Tipo', 'Empleado', 'Fecha', 'Monto', 'Estado'].map((col) => (
              <span key={col} className="text-xs font-semibold text-grey-400 uppercase tracking-wide">
                {col}
              </span>
            ))}
          </div>

          {/* Filas */}
          {actividadReciente.map((item, idx) => (
            <div key={item.id}>
              <div
                className="grid items-center px-6 py-4 hover:bg-grey-100 transition-colors"
                style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}
              >
                {/* Tipo */}
                <div className="flex items-center gap-2">
                  <CheckCircledIcon className="text-primary-300 w-4 h-4" />
                  <span className="text-sm text-grey-700">{item.tipo}</span>
                </div>

                {/* Empleado */}
                <span className="text-sm text-grey-700">{item.empleado}</span>

                {/* Fecha */}
                <span className="text-sm text-grey-400">{item.fecha}</span>

                {/* Monto */}
                <span className={`text-sm font-bold ${item.montoColor}`}>{item.monto}</span>

                {/* Estado — Badge con Tooltip */}
                <Tooltip.Provider delayDuration={300}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold ${item.badgeBg} ${item.badgeColor} w-fit cursor-default`}
                      >
                        {item.estado}
                      </span>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-grey-700 text-white text-xs px-2 py-1 rounded"
                        sideOffset={4}
                      >
                        {item.estado === 'INGRESO' ? 'Registro de ingreso salarial' : 'Registro de deducción'}
                        <Tooltip.Arrow className="fill-grey-700" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>

              {/* Separador entre filas */}
              {idx < actividadReciente.length - 1 && (
                <Separator.Root className="h-px bg-grey-200 mx-6" />
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default DashboardPage
