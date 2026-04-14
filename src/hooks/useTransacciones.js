import { useState, useEffect } from "react";
import { transaccionesService } from "../services/transacciones.service.js";
import { empleadosService } from "../services/empleados.service.js";
import { tiposIngresosService } from "../services/tiposIngresos.service.js";
import { tiposDeduccionesService } from "../services/tiposDeducciones.service.js";

const PAGE_SIZE = 8;

/**
 * Normaliza la respuesta del backend al formato que espera la UI
 * @param {Object} t - Transacción cruda del backend
 * @returns {Object} Transacción normalizada
 */
function normalizarTransaccion(t) {
  // Determinar el tipo: si tiene tipoDeIngreso es ingreso, si tiene tipoDeDeduccion es deducción
  const tieneIngreso = t.tipoDeIngreso != null;
  const tieneDeduccion = t.tipoDeDeduccion != null;

  // El estado se determina por cuál tipo está presente
  const estado = tieneIngreso ? "INGRESO" : "DEDUCCIÓN";

  // El tipo desalario depende de qué tipo esté presente
  const dependeDeSalario = tieneIngreso
    ? t.tipoDeIngreso?.dependeDeSalario
    : tieneDeduccion
      ? t.tipoDeDeduccion?.dependeDeSalario
      : false;

  return {
    id: t.id,
    fecha: t.fecha,
    tipo: t.tipoTransaccion,
    nombreEmpleado: t.empleado?.nombre,
    cedulaEmpleado: t.empleado?.cedula,
    departamentoEmpleado: t.empleado?.departamento,
    monto: t.monto,
    dependeDeSalario: dependeDeSalario,
    estado: estado,
    idAsiento: t.idAsiento,
    // Guardar referencia completa para edición
    empleado: t.empleado,
    tipoDeIngreso: t.tipoDeIngreso,
    tipoDeDeduccion: t.tipoDeDeduccion,
  };
}

/**
 * Hook que centraliza toda la lógica del módulo de transacciones:
 * carga de datos, búsqueda, filtrado por tipo (ingreso/deducción), paginación y CRUD.
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
 *   // Datos para el modal
 *   empleados: import('../types').Empleado[],
 *   tiposIngresos: import('../types').TipoIngreso[],
 *   tiposDeducciones: import('../types').TipoDeduccion[],
 *   crear: (data: TransaccionPayload) => Promise<void>,
 * }}
 */
export function useTransacciones() {
  // ── Estado principal ──
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Filtros ──
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  // ── Paginación ──
  const [pagina, setPagina] = useState(1);

  // ── Estado de guardado ──
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ── Datos para el modal ──
  const [empleados, setEmpleados] = useState([]);
  const [tiposIngresos, setTiposIngresos] = useState([]);
  const [tiposDeducciones, setTiposDeducciones] = useState([]);

  // ── Carga inicial ──
  useEffect(() => {
    Promise.all([cargarTransacciones(), cargarDatosModal()]);
  }, []);

  async function cargarTransacciones() {
    setLoading(true);
    setError(null);
    try {
      const data = await transaccionesService.getAll();
      // Normalizar los datos del backend al formato que espera la UI
      const normalizadas = data.map(normalizarTransaccion);
      setTodos(normalizadas);
    } catch (e) {
      setError(
        e.response?.data?.message ?? "Error al cargar las transacciones",
      );
    } finally {
      setLoading(false);
    }
  }

  async function cargarDatosModal() {
    try {
      // Cargar empleados activos
      const [emps, ingresos, deducciones] = await Promise.all([
        empleadosService.getAll(),
        tiposIngresosService.getAll(),
        tiposDeduccionesService.getAll(),
      ]);

      // Filtrar solo empleados activos
      setEmpleados(emps.filter((e) => e.estado?.toUpperCase() === "ACTIVO"));
      setTiposIngresos(ingresos);
      setTiposDeducciones(deducciones);
    } catch (e) {
      console.error("Error al cargar datos para modal:", e);
    }
  }

  // ── Filtrado + búsqueda ──
  const filtradas = todos.filter((t) => {
    const matchBusqueda =
      busqueda.trim() === "" ||
      t.nombreEmpleado?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.tipo?.toLowerCase().includes(busqueda.toLowerCase());

    const matchTipo =
      filtroTipo === "todos" ||
      t.estado?.toUpperCase() === filtroTipo.toUpperCase();

    return matchBusqueda && matchTipo;
  });

  // ── Paginación ──
  const totalTransacciones = filtradas.length;
  const totalPaginas = Math.max(1, Math.ceil(totalTransacciones / PAGE_SIZE));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const rangoDesde =
    totalTransacciones === 0 ? 0 : (paginaSegura - 1) * PAGE_SIZE + 1;
  const rangoHasta = Math.min(paginaSegura * PAGE_SIZE, totalTransacciones);
  const transacciones = filtradas.slice(
    (paginaSegura - 1) * PAGE_SIZE,
    paginaSegura * PAGE_SIZE,
  );

  // Resetear a página 1 cuando cambian los filtros
  function handleSetBusqueda(v) {
    setBusqueda(v);
    setPagina(1);
  }
  function handleSetFiltroTipo(v) {
    setFiltroTipo(v);
    setPagina(1);
  }

  // ── CRUD: Crear ──
  async function crear(data) {
    setSaving(true);
    setSaveError(null);
    try {
      const nueva = await transaccionesService.create(data);
      // Recargar transacciones para ver la nueva
      await cargarTransacciones();
      return nueva;
    } catch (e) {
      const msg = e.response?.data?.message ?? "Error al crear la transacción";
      setSaveError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }

  // ── CRUD: Actualizar ──
  async function actualizar(data) {
    setSaving(true);
    setSaveError(null);
    try {
      const actualizada = await transaccionesService.update(data);
      await cargarTransacciones();
      return actualizada;
    } catch (e) {
      const msg =
        e.response?.data?.message ?? "Error al actualizar la transacción";
      setSaveError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  }

  // ── CRUD: Eliminar ──
  async function eliminar(id) {
    setSaving(true);
    setSaveError(null);
    try {
      await transaccionesService.delete(id);
      await cargarTransacciones();
    } catch (e) {
      const msg =
        e.response?.data?.message ?? "Error al eliminar la transacción";
      setSaveError(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
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
    // Datos para el modal
    empleados,
    tiposIngresos,
    tiposDeducciones,
    crear,
    actualizar,
    eliminar,
  };
}
