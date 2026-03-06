import { useState, useEffect } from 'react'
import { tiposIngresosService } from '../services/tiposIngresos.service.js'

const PAGE_SIZE = 8

/**
 * Hook que centraliza toda la lógica del módulo de tipos de ingresos:
 * carga de datos, búsqueda, paginación y CRUD.
 *
 * @returns {{
 *   tiposIngresos: import('../types').TipoIngreso[],
 *   tiposIngresosFiltrados: import('../types').TipoIngreso[],
 *   loading: boolean,
 *   error: string | null,
 *   busqueda: string,
 *   setBusqueda: (v: string) => void,
 *   pagina: number,
 *   setPagina: (v: number) => void,
 *   totalPaginas: number,
 *   totalItems: number,
 *   rangoDesde: number,
 *   rangoHasta: number,
 *   crear: (data: import('../types').TipoIngresoPayload) => Promise<void>,
 *   actualizar: (data: import('../types').TipoIngresoUpdatePayload) => Promise<void>,
 *   eliminar: (id: number) => Promise<void>,
 *   saving: boolean,
 *   saveError: string | null,
 * }}
 */
export function useTiposIngresos() {
  // ── Estado principal ──
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Filtros ──
  const [busqueda, setBusqueda] = useState('')

  // ── Paginación ──
  const [pagina, setPagina] = useState(1)

  // ── Estado de guardado ──
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // ── Carga inicial ──
  useEffect(() => {
    cargarTiposIngresos()
  }, [])

  async function cargarTiposIngresos() {
    setLoading(true)
    setError(null)
    try {
      const data = await tiposIngresosService.getAll()
      setTodos(data)
    } catch (e) {
      // 404 del backend cuando no hay registros — no es error real
      if (e.response?.status === 404) {
        setTodos([])
      } else {
        setError(e.response?.data?.message ?? 'Error al cargar los tipos de ingresos')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Filtrado por búsqueda ──
  const filtrados = todos.filter((tipo) => {
    if (busqueda.trim() === '') return true
    return tipo.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  })

  // ── Paginación ──
  const totalItems = filtrados.length
  const totalPaginas = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const rangoDesde = totalItems === 0 ? 0 : (paginaSegura - 1) * PAGE_SIZE + 1
  const rangoHasta = Math.min(paginaSegura * PAGE_SIZE, totalItems)
  const tiposIngresos = filtrados.slice((paginaSegura - 1) * PAGE_SIZE, paginaSegura * PAGE_SIZE)
  // Sin paginar — para exportar o mostrar conteos reales
  const tiposIngresosFiltrados = filtrados

  function handleSetBusqueda(v) {
    setBusqueda(v)
    setPagina(1)
  }

  // ── CRUD ──
  async function crear(data) {
    setSaving(true)
    setSaveError(null)
    try {
      const nuevo = await tiposIngresosService.create(data)
      setTodos((prev) => [...prev, nuevo])
    } catch (e) {
      const msg = e.response?.data?.message ?? 'Error al crear el tipo de ingreso'
      setSaveError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }

  async function actualizar(data) {
    setSaving(true)
    setSaveError(null)
    try {
      const actualizado = await tiposIngresosService.update(data)
      setTodos((prev) => prev.map((t) => (t.id === actualizado.id ? actualizado : t)))
    } catch (e) {
      const msg = e.response?.data?.message ?? 'Error al actualizar el tipo de ingreso'
      setSaveError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(id) {
    setSaving(true)
    setSaveError(null)
    try {
      await tiposIngresosService.remove(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      const msg = e.response?.data?.message ?? 'Error al eliminar el tipo de ingreso'
      setSaveError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }

  return {
    tiposIngresos,
    tiposIngresosFiltrados,
    loading,
    error,
    busqueda,
    setBusqueda: handleSetBusqueda,
    pagina: paginaSegura,
    setPagina,
    totalPaginas,
    totalItems,
    rangoDesde,
    rangoHasta,
    crear,
    actualizar,
    eliminar,
    saving,
    saveError,
  }
}
