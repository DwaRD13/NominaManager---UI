import { useState } from 'react'

const PAGE_SIZE = 8

/** @typedef {{ id: number, nombre: string, tasa: string }} TipoDeduccion */

const MOCK_INICIAL = [
  { id: 1, nombre: 'Seguro Familiar de Salud (SFS)', tasa: '3.04%'    },
  { id: 2, nombre: 'Fondo de Pensiones (AFP)',        tasa: '2.87%'    },
  { id: 3, nombre: 'Impuesto sobre la Renta (ISR)',   tasa: 'Variable' },
  { id: 4, nombre: 'Seguro de Riesgos Laborales',     tasa: '1.20%'    },
  { id: 5, nombre: 'Préstamo Empresarial',             tasa: 'Monto fijo' },
]

let _nextId = 100

/**
 * Hook que centraliza la lógica UI del módulo de tipos de deducciones.
 * Opera con estado local (mock) — sin backend por ahora.
 */
export function useTiposDeducciones() {
  const [todos, setTodos] = useState(MOCK_INICIAL)
  const [busqueda, setBusquedaRaw] = useState('')
  const [pagina, setPagina] = useState(1)
  const [saving, setSaving] = useState(false)

  // ── Filtrado ──
  const filtrados = todos.filter((d) =>
    busqueda.trim() === '' || d.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  // ── Paginación ──
  const totalItems    = filtrados.length
  const totalPaginas  = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
  const paginaSegura  = Math.min(pagina, totalPaginas)
  const rangoDesde    = totalItems === 0 ? 0 : (paginaSegura - 1) * PAGE_SIZE + 1
  const rangoHasta    = Math.min(paginaSegura * PAGE_SIZE, totalItems)
  const tiposDeducciones = filtrados.slice((paginaSegura - 1) * PAGE_SIZE, paginaSegura * PAGE_SIZE)

  function setBusqueda(v) {
    setBusquedaRaw(v)
    setPagina(1)
  }

  // ── CRUD mock ──
  async function crear({ nombre, tasa }) {
    setSaving(true)
    await _delay()
    setTodos((prev) => [...prev, { id: ++_nextId, nombre, tasa }])
    setSaving(false)
  }

  async function actualizar({ id, nombre, tasa }) {
    setSaving(true)
    await _delay()
    setTodos((prev) => prev.map((d) => d.id === id ? { ...d, nombre, tasa } : d))
    setSaving(false)
  }

  async function eliminar(id) {
    setSaving(true)
    await _delay()
    setTodos((prev) => prev.filter((d) => d.id !== id))
    setSaving(false)
  }

  return {
    tiposDeducciones,
    loading: false,
    error: null,
    busqueda,
    setBusqueda,
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
  }
}

/** Simula latencia de red mínima para feedback visual del spinner */
function _delay(ms = 300) {
  return new Promise((res) => setTimeout(res, ms))
}
