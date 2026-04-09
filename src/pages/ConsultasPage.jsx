import { useState } from "react";
import { Select, ToggleGroup, Separator, Tooltip } from "radix-ui";
import {
  MagnifyingGlassIcon,
  CalendarIcon,
  PersonIcon,
  MixerHorizontalIcon,
  FileTextIcon,
  DownloadIcon,
  UpdateIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@radix-ui/react-icons";
import api from "../services/api.js";
import { useEmpleados } from "../hooks/useEmpleados.js";
import { exportarConsultasPDF } from "../lib/exportar.js";

export default function ConsultasPage() {
  const { empleadosFiltrados: empleados, error: errorEmpleados } =
    useEmpleados();
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Estados para los filtros
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    empleadoId: "",
    tipoTransaccion: "TODOS", // Valores: "TODOS", "INGRESO", "DEDUCCION"
  });

  // ESTADOS DE PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const formatearFechaVisual = (fechaStr) => {
    if (!fechaStr) return "";
    const soloFecha = fechaStr.split("T")[0];
    const [year, month, day] = soloFecha.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleGenerarReporte = async () => {
    setCargando(true);
    setBusquedaRealizada(true);
    setCurrentPage(1);

    try {
      const params = new URLSearchParams();
      if (filtros.empleadoId) {
        params.append("empleadoId", filtros.empleadoId);
      }
      // NO enviar tipoTransaccion al backend temporalmente para evitar que el @Query
      // de JPA o de la Base de Datos lo filtre como vacío por diferencias de mayúsculas o espacios.
      // Se delega este filtro al 100% en el bloque "Refuerzo" del Frontend de más abajo.

      if (filtros.fechaInicio) {
        params.append("fechaInicio", filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        params.append("fechaFin", filtros.fechaFin);
      }

      // Llamada directa al endpoint correcto de consultas según tu controlador Controller/Service
      const res = await api.get(
        `/v1/registros-transaccion/consulta?${params.toString()}`,
      );

      // FIX: 1. Solo mostrar transacciones activas (estado == "1")
      let dataFiltrada = res.data.filter((t) => String(t.estado) === "1");

      // FIX: 2. Refuerzo de filtro de Tipo de Transacción en React
      // Por si el @Query dinámico de Java omite registros antiguos o falla la búsqueda
      if (filtros.tipoTransaccion === "INGRESO") {
        dataFiltrada = dataFiltrada.filter(
          (t) => t.tipoTransaccion === "INGRESO" || t.tipoDeIngreso != null,
        );
      } else if (filtros.tipoTransaccion === "DEDUCCION") {
        dataFiltrada = dataFiltrada.filter(
          (t) => t.tipoTransaccion === "DEDUCCION" || t.tipoDeDeduccion != null,
        );
      }

      // Mapear al formato que espera la vista
      const normalizados = dataFiltrada.map((t) => {
        // En tu backend, tipoTransaccion se guarda exactamente como "INGRESO" o "DEDUCCION"
        const esIngreso =
          t.tipoTransaccion === "INGRESO" || t.tipoDeIngreso != null;

        return {
          transaccionId: t.id,
          fecha: t.fecha,
          empleadoId: t.empleado?.id,
          tipoTransaccion: esIngreso ? "INGRESO" : "DEDUCCION",
          tipoNombre: esIngreso
            ? t.tipoDeIngreso?.nombre || "Ingreso"
            : t.tipoDeDeduccion?.nombre || "Deducción",
          monto: t.monto || 0,
          estado: t.estado === "1", // Estado "1" es Activo
        };
      });

      setResultados(normalizados);
    } catch (error) {
      console.error("Error en la consulta:", error);
      window.alert(
        "Error al obtener los datos. Verifica la conexión con el servidor.",
      );
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarReporte = () => {
    if (resultados.length === 0) {
      window.alert("No hay datos para exportar.");
      return;
    }

    try {
      exportarConsultasPDF(resultados, empleados, filtros);
    } catch (e) {
      console.error(e);
      window.alert("Ocurrió un error exportando el PDF.");
    }
  };

  const totalPages = Math.ceil(resultados.length / recordsPerPage) || 1;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = resultados.slice(
    indexOfFirstRecord,
    indexOfLastRecord,
  );

  const getEmpleadoNombre = (id) =>
    empleados.find((e) => e.id === Number(id))?.nombre || `Empleado ID: ${id}`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Body ── */}
      <div className="flex flex-col gap-8 px-8 pt-4 pb-8">
        {/* ── Título + breadcrumbs ── */}
        <div className="flex items-end justify-between pt-10">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-3xl font-bold text-grey-700">
              Consultas Especiales
            </h1>
            <nav className="flex items-center gap-1 text-sm">
              <span className="text-grey-400">Dashboard</span>
              <span className="text-grey-400">/</span>
              <span className="font-medium text-grey-700">Consultas Especiales</span>
            </nav>
          </div>

          {errorEmpleados && (
            <div className="flex items-center gap-2 rounded-xl border border-grey-200 bg-grey-100 px-4 py-2 text-sm font-semibold text-grey-600">
              <UpdateIcon className="w-4 h-4" /> Error al cargar empleados
            </div>
          )}
        </div>

        {/* ── Grid principal ── */}
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* ── PANEL DE FILTROS (IZQUIERDA) ── */}
          <div className="flex flex-col gap-8 rounded-3xl border border-grey-200 bg-white p-8 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 text-grey-700">
              <div className="flex items-center justify-center rounded-2xl bg-primary-100 p-3 text-primary-500">
                <MixerHorizontalIcon className="h-6 w-6" />
              </div>
              <h2 className="m-0 text-2xl font-bold">Filtros</h2>
            </div>

            <Separator.Root className="h-px bg-grey-200" />

            <div className="flex flex-col gap-6">
              {/* Fechas */}
              <div className="flex flex-col gap-3">
                <label className="ml-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-grey-400">
                  <CalendarIcon className="h-4 w-4" /> Rango de Fechas
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaInicio: e.target.value })
                    }
                    className="w-full rounded-2xl border-2 border-grey-200 bg-grey-100 px-4 py-3 font-semibold text-grey-700 outline-none transition-colors focus:border-primary-300"
                  />
                  <input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaFin: e.target.value })
                    }
                    className="w-full rounded-2xl border-2 border-grey-200 bg-grey-100 px-4 py-3 font-semibold text-grey-700 outline-none transition-colors focus:border-primary-300"
                  />
                </div>
              </div>

              {/* Empleado */}
              <div className="flex flex-col gap-3">
                <label className="ml-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-grey-400">
                  <PersonIcon className="h-4 w-4" /> Seleccionar Empleado
                </label>

                <Select.Root
                  value={filtros.empleadoId || "all"}
                  onValueChange={(value) =>
                    setFiltros({
                      ...filtros,
                      empleadoId: value === "all" ? "" : value,
                    })
                  }
                >
                  <Select.Trigger className="flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-grey-200 bg-grey-100 px-5 py-4 text-left font-semibold text-grey-700 outline-none transition-colors focus:border-primary-300">
                    <Select.Value placeholder="Todos los colaboradores" />
                    <Select.Icon>
                      <ChevronDownIcon className="h-4 w-4 text-grey-400" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content
                      className="z-50 overflow-hidden rounded-xl border border-grey-200 bg-white"
                      position="popper"
                      sideOffset={6}
                    >
                      <Select.Viewport className="p-1">
                        <Select.Item
                          value="all"
                          className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-grey-700 outline-none hover:bg-primary-100 hover:text-primary-500 focus:bg-primary-100 focus:text-primary-500"
                        >
                          <Select.ItemText>Todos los colaboradores</Select.ItemText>
                        </Select.Item>

                        {empleados.map((e) => (
                          <Select.Item
                            key={e.id}
                            value={String(e.id)}
                            className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-grey-700 outline-none hover:bg-primary-100 hover:text-primary-500 focus:bg-primary-100 focus:text-primary-500"
                          >
                            <Select.ItemText>
                              {e.nombre} - {e.cedula}
                            </Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>

              {/* Tipo de Movimiento */}
              <div className="flex flex-col gap-3">
                <label className="ml-1 text-xs font-semibold uppercase tracking-wide text-grey-400">
                  Tipo de Movimiento
                </label>

                <ToggleGroup.Root
                  type="single"
                  value={filtros.tipoTransaccion}
                  onValueChange={(value) => {
                    if (!value) return;
                    setFiltros({ ...filtros, tipoTransaccion: value });
                  }}
                  className="grid grid-cols-3 gap-1 rounded-2xl bg-grey-100 p-1"
                  aria-label="Tipo de movimiento"
                >
                  {[
                    { value: "TODOS", label: "Ambos" },
                    { value: "INGRESO", label: "Ingresos" },
                    { value: "DEDUCCION", label: "Deducciones" },
                  ].map((tipo) => (
                    <ToggleGroup.Item
                      key={tipo.value}
                      value={tipo.value}
                      className="cursor-pointer rounded-xl px-3 py-3 text-xs font-semibold text-grey-500 transition-all data-[state=on]:bg-white data-[state=on]:text-grey-700 data-[state=on]:shadow"
                    >
                      {tipo.label}
                    </ToggleGroup.Item>
                  ))}
                </ToggleGroup.Root>
              </div>
            </div>

            <button
              onClick={handleGenerarReporte}
              disabled={cargando}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary-400 px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {cargando ? (
                <UpdateIcon className="h-6 w-6 animate-spin" />
              ) : (
                <FileTextIcon className="h-6 w-6" />
              )}
              Generar Reporte
            </button>
          </div>

          {/* ── PANEL DE RESULTADOS (DERECHA) ── */}
          <div className="h-full">
            {!busquedaRealizada ? (
              <div className="flex min-h-[450px] h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-grey-300 bg-grey-100 px-12 py-12 text-center">
                <div className="mb-6 flex items-center justify-center rounded-full bg-white p-6 shadow">
                  <MagnifyingGlassIcon className="h-12 w-12 text-grey-500" />
                </div>
                <p className="m-0 max-w-xs text-xl font-semibold leading-tight text-grey-600">
                  Define tus parámetros y presiona Generar Reporte para ver los
                  datos.
                </p>
              </div>
            ) : (
              <div className="flex min-h-[450px] h-full flex-col overflow-hidden rounded-3xl border border-grey-200 bg-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between bg-white px-6 py-6">
                  <h3 className="m-0 text-lg font-bold text-grey-700">
                    Registros Encontrados
                  </h3>

                  <Tooltip.Provider delayDuration={250}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <span className="rounded-full bg-primary-400 px-4 py-1 text-xs font-semibold text-white">
                          {resultados.length}
                        </span>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          sideOffset={6}
                          className="rounded bg-grey-700 px-2 py-1 text-xs text-white"
                        >
                          Cantidad total de registros filtrados
                          <Tooltip.Arrow className="fill-grey-700" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                </div>

                <Separator.Root className="h-px bg-grey-200" />

                <div className="max-h-[500px] flex-1 overflow-y-auto">
                  {resultados.length === 0 ? (
                    <div className="px-8 py-20 text-center text-sm font-semibold italic text-grey-400">
                      No hay transacciones que coincidan con estos criterios.
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left">
                      <thead className="sticky top-0 bg-grey-100">
                        <tr>
                          <th className="border-b border-grey-200 px-8 py-5 text-xs font-semibold uppercase tracking-wide text-grey-400">
                            Fecha
                          </th>
                          <th className="border-b border-grey-200 px-5 py-5 text-xs font-semibold uppercase tracking-wide text-grey-400">
                            Empleado
                          </th>
                          <th className="border-b border-grey-200 px-5 py-5 text-xs font-semibold uppercase tracking-wide text-grey-400">
                            Tipo
                          </th>
                          <th className="border-b border-grey-200 px-8 py-5 text-right text-xs font-semibold uppercase tracking-wide text-grey-400">
                            Monto
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {currentRecords.map((r, idx) => (
                          <tr
                            key={r.transaccionId || idx}
                            className="bg-white transition-colors hover:bg-grey-100"
                          >
                            <td className="border-b border-grey-100 px-8 py-5 text-sm font-semibold text-grey-500">
                              {formatearFechaVisual(r.fecha)}
                            </td>
                            <td className="border-b border-grey-100 px-5 py-5">
                              <div className="font-semibold text-grey-700">
                                {getEmpleadoNombre(r.empleadoId)}
                              </div>
                            </td>
                            <td className="border-b border-grey-100 px-5 py-5">
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-sm font-semibold text-grey-600">
                                  {r.tipoNombre}
                                </span>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                                    r.tipoTransaccion === "INGRESO"
                                      ? "bg-primary-100 text-primary-500"
                                      : "bg-grey-200 text-grey-600"
                                  }`}
                                >
                                  {r.tipoTransaccion}
                                </span>
                              </div>
                            </td>
                            <td
                              className={`border-b border-grey-100 px-8 py-5 text-right text-base font-semibold ${
                                r.tipoTransaccion === "INGRESO"
                                  ? "text-primary-500"
                                  : "text-grey-600"
                              }`}
                            >
                              {r.tipoTransaccion === "INGRESO" ? "+" : "-"}$
                              {r.monto?.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Paginación */}
                {resultados.length > recordsPerPage && (
                  <div className="flex items-center justify-between border-t border-grey-200 bg-grey-100 px-4 py-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-wide text-grey-400">
                      Página {currentPage} de {totalPages}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="rounded-lg border border-grey-200 bg-white p-1.5 text-grey-400 transition-colors hover:bg-grey-100 hover:text-grey-700 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                                page === currentPage
                                  ? "bg-primary-400 text-white"
                                  : "border border-grey-200 bg-white text-grey-400 hover:bg-grey-100"
                              }`}
                            >
                              {page}
                            </button>
                          ),
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className="rounded-lg border border-grey-200 bg-white p-1.5 text-grey-400 transition-colors hover:bg-grey-100 hover:text-grey-700 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── BOTÓN DESCARGAR FUNCIONAL ── */}
        <div className="flex w-full justify-center pt-4 pb-12">
          <Tooltip.Provider delayDuration={250}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={handleDescargarReporte}
                  disabled={resultados.length === 0}
                  className="flex items-center gap-4 rounded-2xl bg-grey-500 px-12 py-4 text-base font-semibold text-white transition-colors hover:bg-grey-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <DownloadIcon className="h-6 w-6" />
                  Descargar Reporte
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  sideOffset={6}
                  className="rounded bg-grey-700 px-2 py-1 text-xs text-white"
                >
                  {resultados.length === 0
                    ? "Primero generá una consulta para exportar"
                    : "Exportar resultado actual en PDF"}
                  <Tooltip.Arrow className="fill-grey-700" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </div>
    </div>
  );
}
