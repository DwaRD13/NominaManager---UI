import { useState, useEffect } from 'react'
import { transaccionesService } from '../services/transacciones.service.js'

const PAGE_SIZE = 8

/**
 * Hook que centraliza toda la lógica del módulo de transacciones:
 * carga de datos, búsqueda, filtrado por tipo (ingreso/deducción), paginación.
 *
 * @returns {{
 *   transacciones: Transaccion[],
 *   transaccionesFiltradas: Transaccion[],
 *   loading: boolean,
 *   error: string | null,
 *   busqueda: string,
 *   setBusqueda: (v: string) => void,
 *   filtroTipo: string,
 *   setFiltroTipo: (v: string) => void,
 *   pagina: number,
 *   setPagina: (v: number) => void,
 *   totalPaginas: number,
 *   totalTransacciones: number,
 *   rangoDesde: number,
 *   rangoHasta: number,
 *   saving: boolean,
 *   saveError: string | null,
 * }}
 */
export function useTransacciones() {
  // ── Estado principal ──
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Filtros ──
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  // ── Paginación ──
  const [pagina, setPagina] = useState(1)

  // ── Estado de guardado ──
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // ── Carga inicial ──
  useEffect(() => {
    cargarTransacciones()
  }, [])

  async function cargarTransacciones() {
    setLoading(true)
    setError(null)
    try {
      const data = await transaccionesService.getAll()
      setTodos(data)
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al cargar las transacciones')
    } finally {
      setLoading(false)
    }
  }

  // ── Filtrado + búsqueda ──
  const filtradas = todos.filter((t) => {
    const matchBusqueda =
      busqueda.trim() === '' ||
      t.nombreEmpleado?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.tipo?.toLowerCase().includes(busqueda.toLowerCase())

    const matchTipo =
      filtroTipo === 'todos' ||
      t.estado?.toUpperCase() === filtroTipo.toUpperCase()

    return matchBusqueda && matchTipo
  })

  // ── Paginación ──
  const totalTransacciones = filtradas.length
  const totalPaginas = Math.max(1, Math.ceil(totalTransacciones / PAGE_SIZE))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const rangoDesde = totalTransacciones === 0 ? 0 : (paginaSegura - 1) * PAGE_SIZE + 1
  const rangoHasta = Math.min(paginaSegura * PAGE_SIZE, totalTransacciones)
  const transacciones = filtradas.slice((paginaSegura - 1) * PAGE_SIZE, paginaSegura * PAGE_SIZE)

  // Resetear a página 1 cuando cambian los filtros
  function handleSetBusqueda(v) {
    setBusqueda(v)
    setPagina(1)
  }
  function handleSetFiltroTipo(v) {
    setFiltroTipo(v)
    setPagina(1)
  }

  return {
    transacciones,
    transaccionesFiltradas: filtradas,
    loading,
    error,
    busqueda,
    setBusqueda: handleSetBusqueda,
    filtroTipo,
    setFiltroTipo: handleSetFiltroTipo,
    pagina: paginaSegura,
    setPagina,
    totalPaginas,
    totalTransacciones,
    rangoDesde,
    rangoHasta,
    saving,
    saveError,
  }
}