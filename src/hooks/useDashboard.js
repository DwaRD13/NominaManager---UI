import { useState, useEffect } from 'react'
import { empleadosService } from '../services/empleados.service.js'
import { tiposIngresosService } from '../services/tiposIngresos.service.js'
import { tiposDeduccionesService } from '../services/tiposDeducciones.service.js'
import { transaccionesService } from '../services/transacciones.service.js'

export function useDashboard() {
  const [data, setData] = useState({
    empleados: [],
    tiposIngresos: [],
    transaccionesRecientes: [],
    totalNomina: 0,
    totalIngresosMes: 0,
    totalDeduccionesMes: 0,
    empleadosActivos: 0,
    tiposIngresosCount: 0,
    tiposDeduccionesCount: 0,
    transaccionesCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [empleadosData, ingresosData, deduccionesData, transaccionesData] = await Promise.all([
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
          transaccionesService.getAll().catch((e) => {
            if (e.response?.status === 404) return []
            throw e
          }),
        ])

        const activos = empleadosData.filter((e) => String(e.estado).toUpperCase() === 'ACTIVO')
        const totalNomina = activos.reduce((sum, emp) => sum + (emp.salarioMensual || 0), 0)

        const transaccionesActivas = transaccionesData.filter((t) => String(t.estado) === '1')

        const ahora = new Date()
        const mismoMes = (fecha) => {
          if (!fecha) return false
          const d = new Date(fecha)
          return d.getFullYear() === ahora.getFullYear() && d.getMonth() === ahora.getMonth()
        }

        const transaccionesMes = transaccionesActivas.filter((t) => mismoMes(t.fecha))

        const esIngreso = (t) =>
          t.tipoTransaccion?.toUpperCase() === 'INGRESO' || t.tipoDeIngreso != null

        const totalIngresosMes = transaccionesMes.reduce((sum, t) => {
          return esIngreso(t) ? sum + Number(t.monto || 0) : sum
        }, 0)

        const totalDeduccionesMes = transaccionesMes.reduce((sum, t) => {
          return esIngreso(t) ? sum : sum + Number(t.monto || 0)
        }, 0)

        const transaccionesRecientes = [...transaccionesActivas]
          .sort((a, b) => {
            const fechaA = new Date(a.fecha || a.fechaCreacion || 0).getTime()
            const fechaB = new Date(b.fecha || b.fechaCreacion || 0).getTime()
            return fechaB - fechaA
          })
          .slice(0, 6)
          .map((t) => ({
            id: t.id,
            tipo:
              t.tipoDeIngreso?.nombre ||
              t.tipoDeDeduccion?.nombre ||
              t.tipoTransaccion ||
              '—',
            empleado: t.empleado?.nombre || '—',
            fecha: t.fecha,
            monto: Number(t.monto || 0),
            estado: esIngreso(t) ? 'INGRESO' : 'DEDUCCIÓN',
          }))

        setData({
          empleados: empleadosData,
          tiposIngresos: ingresosData,
          transaccionesRecientes,
          totalNomina,
          totalIngresosMes,
          totalDeduccionesMes,
          empleadosActivos: activos.length,
          tiposIngresosCount: ingresosData.length,
          tiposDeduccionesCount: deduccionesData.length,
          transaccionesCount: transaccionesActivas.length,
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
