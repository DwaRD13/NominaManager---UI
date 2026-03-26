import { useState } from 'react'
import { Select, Separator } from 'radix-ui'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@radix-ui/react-icons'
import { useTransacciones } from '../hooks/useTransacciones.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Formatea un número como moneda en pesos dominicanos */
function formatMonto(valor) {
  if (valor == null) return '—'
  return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(valor)
}

/** Formatea fecha: "25 Feb" */
function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  const fecha = new Date(fechaStr)
  const mes = fecha.toLocaleDateString('es-ES', { month: 'short' })
  const dia = fecha.getDate()
  return `${dia} ${mes.charAt(0).toUpperCase() + mes.slice(1)}`
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
  const {
    transacciones,
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
  } = useTransacciones()

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
            <button
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-400 rounded-xl hover:bg-primary-500 transition-colors cursor-pointer shrink-0"
              style={{ boxShadow: '0px 2px 8px 0px rgba(0,128,128,0.20)' }}
            >
              <PlusIcon />
              Nueva Transacción
            </button>
          </div>

          {/* ── Cabecera de columnas ── */}
          <div
            className="grid items-center px-5 py-3 bg-grey-100 border-b border-grey-200"
            style={{ gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 0.8fr' }}
          >
            {['Fecha', 'Tipo', 'Empleado', 'Monto', 'Estado'].map((col) => (
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
                  style={{ gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr 0.8fr' }}
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

      </div>
    </div>
  )
}

export default TransaccionesPage