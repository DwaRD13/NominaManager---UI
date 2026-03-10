import { useState, useEffect } from 'react'
import { tiposDeduccionesService } from '../services/tiposDeducciones.service.js'

const PAGE_SIZE = 8

/**
 * Hook que centraliza toda la lógica del módulo de tipos de deducciones:
 * carga de datos, búsqueda, paginación y CRUD.
 *
 * @returns {{
 *   tiposDeducciones: import('../types').TipoDeduccion[],
 *   tiposDeduccionesFiltrados: import('../types').TipoDeduccion[],
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
 *   crear: (data: import('../types').TipoDeduccionPayload) => Promise<void>,
 *   actualizar: (data: import('../types').TipoDeduccionUpdatePayload) => Promise<void>,
 *   eliminar: (id: number) => Promise<void>,
 *   saving: boolean,
 *   saveError: string | null,
 * }}
 */
export function useTiposDeducciones() {
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
    cargarTiposDeducciones()
  }, [])

  async function cargarTiposDeducciones() {
    setLoading(true)
    setError(null)
    try {
      const data = await tiposDeduccionesService.getAll()
      setTodos(data)
    } catch (e) {
      // 404 del backend cuando no hay registros — no es error real
      if (e.response?.status === 404) {
        setTodos([])
      } else {
        setError(e.response?.data?.message ?? 'Error al cargar los tipos de deducciones')
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
  const tiposDeducciones = filtrados.slice((paginaSegura - 1) * PAGE_SIZE, paginaSegura * PAGE_SIZE)
  // Sin paginar — para exportar o mostrar conteos reales
  const tiposDeduccionesFiltrados = filtrados

  function handleSetBusqueda(v) {
    setBusqueda(v)
    setPagina(1)
  }

  // ── CRUD ──
  async function crear(data) {
    setSaving(true)
    setSaveError(null)
    try {
      const nuevo = await tiposDeduccionesService.create(data)
      setTodos((prev) => [...prev, nuevo])
    } catch (e) {
      const msg = e.response?.data?.message ?? 'Error al crear el tipo de deducción'
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
      const actualizado = await tiposDeduccionesService.update(data)
      setTodos((prev) => prev.map((t) => (t.id === actualizado.id ? actualizado : t)))
    } catch (e) {
      const msg = e.response?.data?.message ?? 'Error al actualizar el tipo de deducción'
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
      await tiposDeduccionesService.remove(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      const msg = e.response?.data?.message ?? 'Error al eliminar el tipo de deducción'
      setSaveError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }

  return {
    tiposDeducciones,
    tiposDeduccionesFiltrados,
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
