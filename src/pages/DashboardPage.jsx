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
import { useDashboard } from '../hooks/useDashboard.js'
import { useState } from 'react'

async function handleExportarPDF(empleados) {
  const { exportarEmpleadosPDF } = await import('../lib/exportar.js')
  exportarEmpleadosPDF(empleados)
}

function formatCurrency(valor) {
  if (valor == null) return '0.00'
  return new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)
}

function formatFechaCorta(fechaStr) {
  if (!fechaStr) return '—'
  try {
    const [year, month, day] = fechaStr.split('-').map(Number)
    const fecha = new Date(year, month - 1, day)
    const mes = fecha.toLocaleDateString('es-ES', { month: 'short' })
    return `${fecha.getDate()} ${mes.charAt(0).toUpperCase() + mes.slice(1)}`
  } catch {
    return fechaStr
  }
}

function DashboardPage() {
  const { data, loading, error } = useDashboard()
  const [exportando, setExportando] = useState(false)

  const handleGenerarInforme = async () => {
    if (data.empleados.length === 0) return
    setExportando(true)
    try {
      await handleExportarPDF(data.empleados)
    } finally {
      setExportando(false)
    }
  }

  const statCards = [
    {
      id: 'ingresos',
      label: 'Tipos de Ingresos',
      sublabel: loading ? '...' : `${data.tiposIngresosCount} Tipos registrados`,
      icon: ArrowUpIcon,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-500',
    },
    {
      id: 'deducciones',
      label: 'Tipos Deducción',
      sublabel: loading ? '...' : `${data.tiposDeduccionesCount} Tipos registrados`,
      icon: ArrowDownIcon,
      iconBg: 'bg-grey-200',
      iconColor: 'text-grey-600',
    },
    {
      id: 'empleados',
      label: 'Empleados',
      sublabel: loading ? '...' : `${data.empleadosActivos} Activos`,
      icon: PersonIcon,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-500',
    },
    {
      id: 'reportes',
      label: 'Reportes',
      sublabel: exportando ? 'Generando...' : 'Generar PDF Empleados',
      icon: FileTextIcon,
      iconBg: 'bg-primary-100',
      iconColor: 'text-primary-500',
      onClick: handleGenerarInforme,
      clickable: !loading && data.empleados.length > 0 && !exportando
    },
  ]

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

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

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
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-grey-700 text-white text-xs px-2 py-1 rounded"
                      sideOffset={4}
                    >
                      Basado en salarios activos
                      <Tooltip.Arrow className="fill-grey-700" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>

            {/* Monto principal */}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary-400">$</span>
              <span className="text-5xl font-bold text-grey-700">
                {loading ? '...' : formatCurrency(data.totalNomina)}
              </span>
            </div>

            {/* Separador */}
            <Separator.Root className="h-px bg-grey-200" />

            {/* Breakdown Ingresos / Deducciones */}
            <div className="flex items-center gap-8 bg-grey-100 rounded-lg px-4 py-3 border border-grey-200">
              <div className="flex items-center gap-3">
                <span className="text-grey-400 text-sm font-medium">Ingresos brutos:</span>
                <span className="text-base font-bold text-primary-400">
                  ${loading ? '...' : formatCurrency(data.totalIngresosMes)}
                </span>
              </div>
              <Separator.Root orientation="vertical" className="w-px h-6 bg-grey-300" />
              <div className="flex items-center gap-3">
                <span className="text-grey-400 text-sm font-medium">Deducciones reales:</span>
                <span className="text-base font-bold text-grey-600">
                  -${loading ? '...' : formatCurrency(data.totalDeduccionesMes)}
                </span>
              </div>
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
                <span className="text-sm font-medium text-grey-700">Pendiente</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-grey-400">Estado:</span>
                <span className="text-sm font-medium text-grey-400">Módulo no disponible</span>
              </div>
            </div>

            {/* Botón Enviar WS */}
            <button
              disabled
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary-400 text-white text-sm font-medium transition-colors opacity-50 cursor-not-allowed"
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
                onClick={card.clickable ? card.onClick : undefined}
                className={`bg-white rounded-xl border border-grey-200 p-4 flex items-center gap-4 transition-colors ${
                  card.clickable ? 'cursor-pointer hover:bg-primary-100/30' : ''
                } ${card.id === 'reportes' && !card.clickable ? 'opacity-70' : ''}`}
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
          {loading ? (
            <div className="px-6 py-8 text-sm text-grey-400">Cargando actividad...</div>
          ) : data.transaccionesRecientes.length === 0 ? (
            <div className="px-6 py-8 text-sm text-grey-400">No hay actividad reciente disponible.</div>
          ) : (
            data.transaccionesRecientes.map((item, idx) => {
              const esIngreso = item.estado === 'INGRESO'

              return (
                <div key={item.id}>
                  <div
                    className="grid items-center px-6 py-4 hover:bg-grey-100 transition-colors"
                    style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' }}
                  >
                    {/* Tipo */}
                    <div className="flex items-center gap-2">
                      <CheckCircledIcon className={esIngreso ? 'text-primary-300 w-4 h-4' : 'text-grey-400 w-4 h-4'} />
                      <span className="text-sm text-grey-700">{item.tipo}</span>
                    </div>

                    {/* Empleado */}
                    <span className="text-sm text-grey-700">{item.empleado}</span>

                    {/* Fecha */}
                    <span className="text-sm text-grey-400">{formatFechaCorta(item.fecha)}</span>

                    {/* Monto */}
                    <span className={`text-sm font-bold ${esIngreso ? 'text-primary-400' : 'text-grey-600'}`}>
                      {esIngreso ? '+' : '-'}${formatCurrency(item.monto)}
                    </span>

                    {/* Estado — Badge con Tooltip */}
                    <Tooltip.Provider delayDuration={300}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold ${esIngreso ? 'bg-primary-100 text-primary-500' : 'bg-grey-200 text-grey-600'} w-fit cursor-default`}
                          >
                            {item.estado}
                          </span>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-grey-700 text-white text-xs px-2 py-1 rounded"
                            sideOffset={4}
                          >
                            {esIngreso ? 'Registro de ingreso salarial' : 'Registro de deducción'}
                            <Tooltip.Arrow className="fill-grey-700" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </div>

                  {/* Separador entre filas */}
                  {idx < data.transaccionesRecientes.length - 1 && (
                    <Separator.Root className="h-px bg-grey-200 mx-6" />
                  )}
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}

export default DashboardPage
