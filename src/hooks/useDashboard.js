import { useState, useEffect } from 'react'
import { empleadosService } from '../services/empleados.service.js'
import { tiposIngresosService } from '../services/tiposIngresos.service.js'
import { tiposDeduccionesService } from '../services/tiposDeducciones.service.js'

export function useDashboard() {
  const [data, setData] = useState({
    empleados: [],
    tiposIngresos: [],
    totalNomina: 0,
    empleadosActivos: 0,
    tiposIngresosCount: 0,
    tiposDeduccionesCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [empleadosData, ingresosData, deduccionesData] = await Promise.all([
          empleadosService.getAll().catch((e) => {
            if (e.response?.status === 404) return []
            throw e
          }),
          tiposIngresosService.getAll().catch((e) => {
            if (e.response?.status === 404) return []
            throw e
          }),
          tiposDeduccionesService.getAll().catch((e) => {
            if (e.response?.status === 404) return []
            throw e
          }),
        ])

        const activos = empleadosData.filter((e) => e.estado === 'ACTIVO')
        const totalNomina = activos.reduce((sum, emp) => sum + (emp.salarioMensual || 0), 0)

        setData({
          empleados: empleadosData,
          tiposIngresos: ingresosData,
          totalNomina,
          empleadosActivos: activos.length,
          tiposIngresosCount: ingresosData.length,
          tiposDeduccionesCount: deduccionesData.length,
        })
      } catch (err) {
        setError(err.response?.data?.message ?? 'Error al cargar los datos del dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
