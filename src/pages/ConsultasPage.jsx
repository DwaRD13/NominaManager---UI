import { useState } from "react";
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        fontFamily: "inherit",
        backgroundColor: "#f9fafb",
      }}
    >
      {/* ── Body ── */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          width: "100%",
          padding: "1rem 2rem 2rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
          boxSizing: "border-box",
        }}
      >
        {/* Título */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingTop: "1rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "2.25rem",
                fontWeight: 900,
                color: "#111827",
                letterSpacing: "-0.05em",
              }}
            >
              Consultas Especiales
            </h1>
            <p
              style={{
                margin: 0,
                color: "#6B7280",
                fontSize: "0.75rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Reportes por criterios cruzados
            </p>
          </div>
          {errorEmpleados && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid #FCA5A5",
                fontSize: "0.875rem",
                fontWeight: 700,
              }}
            >
              <UpdateIcon width={18} height={18} /> Error al cargar empleados
            </div>
          )}
        </div>

        {/* Grid Principal */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* PANEL DE FILTROS (IZQUIERDA) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "1.5rem",
              padding: "2rem",
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              border: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                color: "#111827",
              }}
            >
              <div
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#EEF2FF",
                  borderRadius: "1rem",
                  color: "#4F46E5",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MixerHorizontalIcon width={24} height={24} strokeWidth={3} />
              </div>
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900 }}>
                Filtros
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* Fechas */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.625rem",
                    fontWeight: 900,
                    color: "#9CA3AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginLeft: "0.25rem",
                  }}
                >
                  <CalendarIcon width={14} height={14} /> Rango de Fechas
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <input
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaInicio: e.target.value })
                    }
                    style={{
                      width: "100%",
                      border: "2px solid #F3F4F6",
                      borderRadius: "1rem",
                      padding: "0.75rem 1rem",
                      outline: "none",
                      backgroundColor: "#F9FAFB",
                      fontWeight: 700,
                      color: "#111827",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                  <input
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) =>
                      setFiltros({ ...filtros, fechaFin: e.target.value })
                    }
                    style={{
                      width: "100%",
                      border: "2px solid #F3F4F6",
                      borderRadius: "1rem",
                      padding: "0.75rem 1rem",
                      outline: "none",
                      backgroundColor: "#F9FAFB",
                      fontWeight: 700,
                      color: "#111827",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {/* Empleado */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.625rem",
                    fontWeight: 900,
                    color: "#9CA3AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginLeft: "0.25rem",
                  }}
                >
                  <PersonIcon width={14} height={14} /> Seleccionar Empleado
                </label>
                <select
                  value={filtros.empleadoId}
                  onChange={(e) =>
                    setFiltros({ ...filtros, empleadoId: e.target.value })
                  }
                  style={{
                    width: "100%",
                    border: "2px solid #F3F4F6",
                    borderRadius: "1rem",
                    padding: "1rem 1.25rem",
                    outline: "none",
                    backgroundColor: "#F9FAFB",
                    fontWeight: 700,
                    color: "#111827",
                    appearance: "none",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                >
                  <option value="">Todos los colaboradores</option>
                  {empleados.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre} - {e.cedula}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Movimiento */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.625rem",
                    fontWeight: 900,
                    color: "#9CA3AF",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginLeft: "0.25rem",
                  }}
                >
                  Tipo de Movimiento
                </label>
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#F3F4F6",
                    padding: "0.25rem",
                    borderRadius: "1rem",
                  }}
                >
                  {["TODOS", "INGRESO", "DEDUCCION"].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() =>
                        setFiltros({ ...filtros, tipoTransaccion: tipo })
                      }
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                        fontWeight: 900,
                        cursor: "pointer",
                        border: "none",
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                        backgroundColor:
                          filtros.tipoTransaccion === tipo
                            ? "#FFFFFF"
                            : "transparent",
                        color:
                          filtros.tipoTransaccion === tipo
                            ? "#111827"
                            : "#6B7280",
                        boxShadow:
                          filtros.tipoTransaccion === tipo
                            ? "0 1px 3px rgba(0,0,0,0.1)"
                            : "none",
                      }}
                    >
                      {tipo === "TODOS"
                        ? "Ambos"
                        : tipo === "INGRESO"
                          ? "Ingresos"
                          : "Deducciones"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerarReporte}
              disabled={cargando}
              style={{
                width: "100%",
                padding: "1.25rem",
                backgroundColor: "#007A33",
                color: "#ffffff",
                fontWeight: 900,
                fontSize: "1.125rem",
                borderRadius: "1rem",
                boxShadow: "0 20px 25px -5px rgba(0, 122, 51, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                border: "none",
                cursor: cargando ? "not-allowed" : "pointer",
                opacity: cargando ? 0.7 : 1,
                fontFamily: "inherit",
              }}
            >
              {cargando ? (
                <UpdateIcon className="animate-spin" width={24} height={24} />
              ) : (
                <FileTextIcon width={24} height={24} />
              )}
              GENERAR REPORTE
            </button>
          </div>

          {/* PANEL DE RESULTADOS (DERECHA) */}
          <div style={{ height: "100%" }}>
            {!busquedaRealizada ? (
              <div
                style={{
                  height: "100%",
                  minHeight: "450px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F3E8FF",
                  border: "2px dashed #D8B4FE",
                  borderRadius: "3rem",
                  padding: "3rem",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "1.5rem",
                    borderRadius: "9999px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    marginBottom: "1.5rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MagnifyingGlassIcon width={48} height={48} color="#A855F7" />
                </div>
                <p
                  style={{
                    color: "#7E22CE",
                    fontSize: "1.25rem",
                    fontWeight: 900,
                    margin: 0,
                    maxWidth: "20rem",
                    lineHeight: 1.2,
                  }}
                >
                  Define tus parámetros y presiona Generar Reporte para ver los
                  datos.
                </p>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "1.5rem",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  height: "100%",
                  minHeight: "450px",
                  border: "none",
                }}
              >
                <div
                  style={{
                    padding: "1.5rem",
                    borderBottom: "1px solid #F3F4F6",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.25rem",
                      fontWeight: 900,
                      color: "#111827",
                      textTransform: "uppercase",
                      letterSpacing: "-0.05em",
                    }}
                  >
                    Registros Encontrados
                  </h3>
                  <span
                    style={{
                      backgroundColor: "#4F46E5",
                      color: "#ffffff",
                      padding: "0.25rem 1rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 900,
                    }}
                  >
                    {resultados.length}
                  </span>
                </div>

                <div style={{ flex: 1, overflowY: "auto", maxHeight: "500px" }}>
                  {resultados.length === 0 ? (
                    <div
                      style={{
                        padding: "5rem",
                        textAlign: "center",
                        color: "#9CA3AF",
                        fontWeight: 700,
                        fontStyle: "italic",
                      }}
                    >
                      No hay transacciones que coincidan con estos criterios.
                    </div>
                  ) : (
                    <table
                      style={{
                        width: "100%",
                        textAlign: "left",
                        borderCollapse: "collapse",
                      }}
                    >
                      <thead
                        style={{
                          backgroundColor: "#F9FAFB",
                          position: "sticky",
                          top: 0,
                        }}
                      >
                        <tr>
                          <th
                            style={{
                              padding: "1.25rem 2rem",
                              color: "#9CA3AF",
                              fontSize: "0.625rem",
                              fontWeight: 900,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              borderBottom: "1px solid #F3F4F6",
                            }}
                          >
                            Fecha
                          </th>
                          <th
                            style={{
                              padding: "1.25rem",
                              color: "#9CA3AF",
                              fontSize: "0.625rem",
                              fontWeight: 900,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              borderBottom: "1px solid #F3F4F6",
                            }}
                          >
                            Empleado
                          </th>
                          <th
                            style={{
                              padding: "1.25rem",
                              color: "#9CA3AF",
                              fontSize: "0.625rem",
                              fontWeight: 900,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              borderBottom: "1px solid #F3F4F6",
                            }}
                          >
                            Tipo
                          </th>
                          <th
                            style={{
                              padding: "1.25rem 2rem",
                              color: "#9CA3AF",
                              fontSize: "0.625rem",
                              fontWeight: 900,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              borderBottom: "1px solid #F3F4F6",
                              textAlign: "right",
                            }}
                          >
                            Monto
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentRecords.map((r, idx) => (
                          <tr
                            key={r.transaccionId || idx}
                            style={{
                              backgroundColor: "#ffffff",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#F9FAFB")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#ffffff")
                            }
                          >
                            <td
                              style={{
                                padding: "1.25rem 2rem",
                                borderBottom: "1px solid #F9FAFB",
                                color: "#6B7280",
                                fontWeight: 700,
                                fontSize: "0.875rem",
                              }}
                            >
                              {formatearFechaVisual(r.fecha)}
                            </td>
                            <td
                              style={{
                                padding: "1.25rem",
                                borderBottom: "1px solid #F9FAFB",
                              }}
                            >
                              <div
                                style={{ fontWeight: 900, color: "#111827" }}
                              >
                                {getEmpleadoNombre(r.empleadoId)}
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "1.25rem",
                                borderBottom: "1px solid #F9FAFB",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-start",
                                  gap: "0.25rem",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.875rem",
                                    fontWeight: 800,
                                    color: "#4B5563",
                                  }}
                                >
                                  {r.tipoNombre}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.625rem",
                                    fontWeight: 900,
                                    textTransform: "uppercase",
                                    padding: "0.15rem 0.4rem",
                                    borderRadius: "0.25rem",
                                    backgroundColor:
                                      r.tipoTransaccion === "INGRESO"
                                        ? "#D1FAE5"
                                        : "#FEE2E2",
                                    color:
                                      r.tipoTransaccion === "INGRESO"
                                        ? "#059669"
                                        : "#DC2626",
                                  }}
                                >
                                  {r.tipoTransaccion}
                                </span>
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "1.25rem 2rem",
                                borderBottom: "1px solid #F9FAFB",
                                textAlign: "right",
                                fontWeight: 900,
                                fontSize: "1.125rem",
                                color:
                                  r.tipoTransaccion === "INGRESO"
                                    ? "#059669"
                                    : "#EF4444",
                              }}
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
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#F9FAFB",
                      borderTop: "1px solid #F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.625rem",
                        fontWeight: 900,
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Página {currentPage} de {totalPages}
                    </p>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        style={{
                          padding: "0.375rem",
                          borderRadius: "0.5rem",
                          backgroundColor: "#ffffff",
                          border: "1px solid #E5E7EB",
                          color: "#9CA3AF",
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                          opacity: currentPage === 1 ? 0.3 : 1,
                        }}
                      >
                        <ChevronLeftIcon width={16} height={16} />
                      </button>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{
                              width: "1.75rem",
                              height: "1.75rem",
                              borderRadius: "0.5rem",
                              fontWeight: 900,
                              fontSize: "0.625rem",
                              border:
                                page === currentPage
                                  ? "none"
                                  : "1px solid #E5E7EB",
                              backgroundColor:
                                page === currentPage ? "#4F46E5" : "#ffffff",
                              color:
                                page === currentPage ? "#ffffff" : "#9CA3AF",
                              cursor: "pointer",
                            }}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        style={{
                          padding: "0.375rem",
                          borderRadius: "0.5rem",
                          backgroundColor: "#ffffff",
                          border: "1px solid #E5E7EB",
                          color: "#9CA3AF",
                          cursor:
                            currentPage === totalPages
                              ? "not-allowed"
                              : "pointer",
                          opacity: currentPage === totalPages ? 0.3 : 1,
                        }}
                      >
                        <ChevronRightIcon width={16} height={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN DESCARGAR FUNCIONAL */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "1rem",
            paddingBottom: "3rem",
            width: "100%",
          }}
        >
          <button
            onClick={handleDescargarReporte}
            disabled={resultados.length === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1.25rem 3rem",
              backgroundColor: "#849A9A",
              color: "#ffffff",
              fontWeight: 900,
              fontSize: "1.25rem",
              borderRadius: "1rem",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              border: "none",
              cursor: resultados.length === 0 ? "not-allowed" : "pointer",
              opacity: resultados.length === 0 ? 0.5 : 1,
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
          >
            <DownloadIcon width={24} height={24} strokeWidth={3} />
            DESCARGAR REPORTES
          </button>
        </div>
      </div>
    </div>
  );
}
