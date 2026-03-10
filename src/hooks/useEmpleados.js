import { useState, useEffect } from 'react'
import { empleadosService } from '../services/empleados.service.js'

const PAGE_SIZE = 8

/**
 * Hook que centraliza toda la lógica del módulo de empleados:
 * carga de datos, búsqueda, filtrado por estado, paginación y CRUD.
 *
 * @returns {{
 *   empleados: import('../types').Empleado[],
 *   loading: boolean,
 *   error: string | null,
 *   busqueda: string,
 *   setBusqueda: (v: string) => void,
 *   filtroEstado: string,
 *   setFiltroEstado: (v: string) => void,
 *   pagina: number,
 *   setPagina: (v: number) => void,
 *   totalPaginas: number,
 *   totalEmpleados: number,
 *   rangoDesde: number,
 *   rangoHasta: number,
 *   crear: (data: import('../types').EmpleadoPayload) => Promise<void>,
 *   actualizar: (data: import('../types').EmpleadoUpdatePayload) => Promise<void>,
 *   eliminar: (id: number) => Promise<void>,
 *   saving: boolean,
 *   saveError: string | null,
 * }}
 */
export function useEmpleados() {
  // ── Estado principal ──
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Filtros ──
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')

  // ── Paginación ──
  const [pagina, setPagina] = useState(1)

  // ── Estado de guardado ──
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // ── Carga inicial ──
  useEffect(() => {
    cargarEmpleados()
  }, [])

  async function cargarEmpleados() {
    setLoading(true)
    setError(null)
    try {
      const data = await empleadosService.getAll()
      setTodos(data)
    } catch (e) {
      setError(e.response?.data?.message ?? 'Error al cargar los empleados')
    } finally {
      setLoading(false)
    }
  }

  // ── Filtrado + búsqueda ──
  const filtrados = todos.filter((emp) => {
    const matchBusqueda =
      busqueda.trim() === '' ||
      emp.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.cedula?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.puesto?.toLowerCase().includes(busqueda.toLowerCase()) ||
      emp.departamento?.toLowerCase().includes(busqueda.toLowerCase())

    const matchEstado =
      filtroEstado === 'todos' ||
      emp.estado?.toUpperCase() === filtroEstado.toUpperCase()

    return matchBusqueda && matchEstado
  })

  // ── Paginación ──
  const totalEmpleados = filtrados.length
  const totalPaginas = Math.max(1, Math.ceil(totalEmpleados / PAGE_SIZE))
  const paginaSegura = Math.min(pagina, totalPaginas)
  const rangoDesde = totalEmpleados === 0 ? 0 : (paginaSegura - 1) * PAGE_SIZE + 1
  const rangoHasta = Math.min(paginaSegura * PAGE_SIZE, totalEmpleados)
  const empleados = filtrados.slice((paginaSegura - 1) * PAGE_SIZE, paginaSegura * PAGE_SIZE)
  // empleadosFiltrados = todos los que pasan los filtros, sin paginar (para exportar)
  const empleadosFiltrados = filtrados

  // Resetear a página 1 cuando cambian los filtros
  function handleSetBusqueda(v) {
    setBusqueda(v)
    setPagina(1)
  }
  function handleSetFiltroEstado(v) {
    setFiltroEstado(v)
    setPagina(1)
  }

  // ── CRUD ──
  async function crear(data) {
    setSaving(true)
    setSaveError(null)
    try {
      const nuevo = await empleadosService.create(data)
      setTodos((prev) => [...prev, nuevo])
    } catch (e) {
      const msg = e.response?.data?.message ?? 'Error al crear el empleado'
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
      const actualizado = await empleadosService.update(data)
      setTodos((prev) => prev.map((e) => (e.id === actualizado.id ? actualizado : e)))
    } catch (e) {
      const msg = e.response?.data?.message ?? 'Error al actualizar el empleado'
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
      await empleadosService.remove(id)
      setTodos((prev) => prev.filter((e) => e.id !== id))
    } catch (e) {
      const msg = e.response?.data?.message ?? 'Error al eliminar el empleado'
      setSaveError(msg)
      throw new Error(msg)
    } finally {
      setSaving(false)
    }
  }

  return {
    empleados,
    empleadosFiltrados,
    loading,
    error,
    busqueda,
    setBusqueda: handleSetBusqueda,
    filtroEstado,
    setFiltroEstado: handleSetFiltroEstado,
    pagina: paginaSegura,
    setPagina,
    totalPaginas,
    totalEmpleados,
    rangoDesde,
    rangoHasta,
    crear,
    actualizar,
    eliminar,
    saving,
    saveError,
  }
}
