import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import * as Separator from "@radix-ui/react-separator";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CheckIcon,
  EyeOpenIcon,
  UpdateIcon,
  DownloadIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import { useAsientoContable } from "../hooks/useAsientosContables.js";
import { useToast } from "../hooks/useToast.jsx";

// ──────────────────────────────────────────────────────────────────
// Funciones de exportación (lazy loading)
// ──────────────────────────────────────────────────────────────────
async function exportarPDF(asientos) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();
  doc.text("Listado de Asientos Contables", 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [
      [
        "ID",
        "Descripción",
        "Moneda",
        "Fecha Inicio",
        "Fecha Fin",
        "Monto Total",
      ],
    ],
    body: asientos.map((a) => [
      a.id,
      a.descripcion,
      a.moneda?.nombre || "—",
      new Date(a.fechaInicio).toLocaleDateString("es-DO"),
      new Date(a.fechaFin).toLocaleDateString("es-DO"),
      formatMoney(a.montoTotal),
    ]),
  });
  doc.save("asientos_contables.pdf");
}

async function exportarXLSX(asientos) {
  const XLSX = await import("xlsx");
  const data = asientos.map((a) => ({
    ID: a.id,
    Descripción: a.descripcion,
    Moneda: a.moneda?.nombre || "—",
    "Fecha Inicio": new Date(a.fechaInicio).toLocaleDateString("es-DO"),
    "Fecha Fin": new Date(a.fechaFin).toLocaleDateString("es-DO"),
    "Monto Total": a.montoTotal,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Asientos");
  XLSX.writeFile(wb, "asientos_contables.xlsx");
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────
const formatMoney = (val) =>
  new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    val ?? 0,
  );

function formatDateLocal(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-DO");
}

// ──────────────────────────────────────────────────────────────────
// Diálogo para crear nuevo asiento (con validación de fechas)
// ──────────────────────────────────────────────────────────────────
function NuevoAsientoDialog({ monedas, onGuardar, saving, toast }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    descripcion: "",
    monedaId: "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [errorLocal, setErrorLocal] = useState("");

  const resetForm = () => {
    setForm({ descripcion: "", monedaId: "", fechaInicio: "", fechaFin: "" });
    setErrorLocal("");
  };

  const handleGuardar = async () => {
    // Validaciones locales
    if (!form.descripcion.trim()) {
      setErrorLocal("La descripción es obligatoria.");
      return;
    }
    if (!form.monedaId) {
      setErrorLocal("Debes seleccionar una moneda.");
      return;
    }
    if (!form.fechaInicio || !form.fechaFin) {
      setErrorLocal("Las fechas de inicio y fin son obligatorias.");
      return;
    }
    if (new Date(form.fechaInicio) > new Date(form.fechaFin)) {
      setErrorLocal("La fecha de inicio no puede ser mayor a la fecha fin.");
      return;
    }

    const monedaSeleccionada = monedas.find(
      (m) => m.id.toString() === form.monedaId,
    );
    if (!monedaSeleccionada) {
      setErrorLocal("Moneda inválida.");
      return;
    }

    try {
      setErrorLocal("");
      await onGuardar({
        moneda: monedaSeleccionada,
        descripcion: form.descripcion,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
      });
      toast({
        title: "Asiento creado",
        description: `"${form.descripcion}" fue registrado exitosamente.`,
        variant: "success",
      });
      setOpen(false);
      resetForm();
    } catch (err) {
      // Error proveniente del backend
      toast({
        title: "Error al crear asiento",
        description: err.message || "Ocurrió un error inesperado.",
        variant: "error",
      });
      setErrorLocal(err.message);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-400 rounded-xl hover:bg-primary-500 transition-colors shadow-sm cursor-pointer">
          <PlusIcon /> Nuevo Asiento
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl p-6 w-full max-w-md shadow-2xl focus:outline-none">
          <Dialog.Title className="text-xl font-bold text-grey-700">
            Preparar Asiento
          </Dialog.Title>
          <Dialog.Description className="text-sm text-grey-400 mb-5">
            Selecciona el periodo para generar el asiento de nómina.
          </Dialog.Description>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">
                Descripción *
              </label>
              <input
                className="w-full px-3 py-2 border border-grey-200 rounded-lg text-sm focus:border-primary-400 outline-none"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
                placeholder="Ej: Nómina Abril Primera Quincena"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">
                  Desde *
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-grey-200 rounded-lg text-sm outline-none"
                  onChange={(e) =>
                    setForm({ ...form, fechaInicio: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">
                  Hasta *
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-grey-200 rounded-lg text-sm outline-none"
                  onChange={(e) =>
                    setForm({ ...form, fechaFin: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">
                Moneda *
              </label>
              <Select.Root
                onValueChange={(val) => setForm({ ...form, monedaId: val })}
              >
                <Select.Trigger className="flex justify-between items-center w-full px-3 py-2 border border-grey-200 rounded-lg text-sm cursor-pointer outline-none">
                  <Select.Value placeholder="Seleccionar moneda..." />
                  <ChevronDownIcon />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-white border border-grey-200 rounded-lg shadow-xl z-50">
                    <Select.Viewport className="p-1">
                      {monedas.map((m) => (
                        <Select.Item
                          key={m.id}
                          value={m.id.toString()}
                          className="flex items-center px-8 py-2 text-sm rounded cursor-pointer hover:bg-primary-100 outline-none"
                        >
                          <Select.ItemText>
                            {m.nombre} ({m.codigoIso})
                          </Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {errorLocal && (
              <p className="text-xs text-red-500 font-medium">{errorLocal}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-grey-500 rounded-lg border border-grey-200 hover:bg-grey-100 cursor-pointer">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="bg-primary-400 text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary-500 disabled:opacity-50 cursor-pointer"
            >
              {saving && <UpdateIcon className="animate-spin" />}
              {saving ? "Generando..." : "Generar Asiento"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ──────────────────────────────────────────────────────────────────
// Diálogo para ver detalles del asiento (DTO)
// ──────────────────────────────────────────────────────────────────
function DetalleAsientoDialog({ asientoId, obtenerDetalle, toast, children }) {
  const [open, setOpen] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState(null);

  const handleOpenChange = async (isOpen) => {
    if (isOpen && asientoId) {
      setCargando(true);
      setErrorDetalle(null);
      try {
        const data = await obtenerDetalle(asientoId);
        setDetalle(data);
      } catch (err) {
        setErrorDetalle(err.message);
        toast({
          title: "Error al cargar detalles",
          description: err.message,
          variant: "error",
        });
      } finally {
        setCargando(false);
      }
    }
    setOpen(isOpen);
    if (!isOpen) {
      setDetalle(null);
      setErrorDetalle(null);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl focus:outline-none">
          <Dialog.Title className="text-xl font-bold text-grey-700 mb-1">
            Detalle del Asiento #{asientoId}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-grey-400 mb-4">
            Información completa del asiento y sus transacciones.
          </Dialog.Description>
          <Separator.Root className="h-px bg-grey-200 mb-4" />

          {cargando && (
            <div className="flex justify-center py-8">
              <UpdateIcon className="animate-spin w-6 h-6 text-primary-400" />
            </div>
          )}

          {errorDetalle && (
            <div className="p-3 bg-red-50 text-red-500 rounded-lg text-sm">
              {errorDetalle}
            </div>
          )}

          {detalle && (
            <div className="flex flex-col gap-4 text-sm">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-2 bg-grey-50 p-3 rounded-lg">
                <span className="font-semibold text-grey-600">ID Asiento:</span>
                <span>{detalle.idAsiento ?? detalle.id}</span>
                <span className="font-semibold text-grey-600">
                  Descripción:
                </span>
                <span>{detalle.descripcion || "—"}</span>
                <span className="font-semibold text-grey-600">
                  Fecha del asiento:
                </span>
                <span>{formatDateLocal(detalle.fecha)}</span>
                <span className="font-semibold text-grey-600">
                  Monto total:
                </span>
                <span className="font-bold text-primary-600">
                  {formatMoney(detalle.monto)}
                </span>
                <span className="font-semibold text-grey-600">Estado:</span>
                <span>
                  {detalle.estado === "1" ? "Activo" : detalle.estado || "—"}
                </span>
              </div>

              {/* Si hay lista de transacciones (detalle.transacciones o similar) */}
              {detalle.transacciones && detalle.transacciones.length > 0 && (
                <>
                  <h3 className="font-bold text-grey-700 mt-2">
                    Transacciones
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full text-xs">
                      <thead className="bg-grey-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Tipo</th>
                          <th className="px-3 py-2 text-left">Empleado</th>
                          <th className="px-3 py-2 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalle.transacciones.map((t, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-3 py-2">
                              {t.tipoTransaccion ||
                                t.tipoDeIngreso?.nombre ||
                                "—"}
                            </td>
                            <td className="px-3 py-2">
                              {t.empleado?.nombre || "—"}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {formatMoney(t.monto)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Si el detalle tiene un solo objeto empleado o ingreso, mostrarlo */}
              {detalle.empleado && (
                <div className="bg-grey-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-grey-700 mb-2">Empleado</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span>Nombre:</span>
                    <span>{detalle.empleado.nombre || "—"}</span>
                    <span>Cédula:</span>
                    <span>{detalle.empleado.cedula || "—"}</span>
                    <span>Departamento:</span>
                    <span>{detalle.empleado.departamento || "—"}</span>
                    <span>Estado:</span>
                    <span>{detalle.empleado.estado || "—"}</span>
                  </div>
                </div>
              )}

              {detalle.tipoDeIngreso && (
                <div className="bg-grey-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-grey-700 mb-2">
                    Concepto de ingreso
                  </h4>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span>Nombre:</span>
                    <span>{detalle.tipoDeIngreso.nombre}</span>
                    <span>Depende de salario:</span>
                    <span>
                      {detalle.tipoDeIngreso.dependeDeSalario ? "Sí" : "No"}
                    </span>
                    <span>Estado:</span>
                    <span>{detalle.tipoDeIngreso.estado}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-grey-500 rounded-lg border border-grey-200 hover:bg-grey-100">
                Cerrar
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ──────────────────────────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────────────────────────
export default function AsientoContablePage() {
  const { toast } = useToast();
  const {
    asientos,
    monedas,
    loading,
    saving,
    crearAsiento,
    obtenerDetalle,
    error,
  } = useAsientoContable();
  const [busqueda, setBusqueda] = useState("");

  const filtrados = asientos.filter((a) =>
    a.descripcion?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const handleExportPDF = () => {
    if (filtrados.length === 0) {
      toast({
        title: "No hay datos",
        description: "No hay asientos para exportar.",
        variant: "error",
      });
      return;
    }
    exportarPDF(filtrados).catch((err) =>
      toast({
        title: "Error al exportar PDF",
        description: err.message,
        variant: "error",
      }),
    );
  };

  const handleExportXLSX = () => {
    if (filtrados.length === 0) {
      toast({
        title: "No hay datos",
        description: "No hay asientos para exportar.",
        variant: "error",
      });
      return;
    }
    exportarXLSX(filtrados).catch((err) =>
      toast({
        title: "Error al exportar XLSX",
        description: err.message,
        variant: "error",
      }),
    );
  };

  return (
    <div className="flex flex-col gap-6 px-8 pt-10 pb-8 min-h-screen bg-grey-50">
      <div>
        <h1 className="text-3xl font-bold text-grey-700">Asientos Contables</h1>
        <nav className="flex items-center gap-1 text-sm text-grey-400">
          <span>Contabilidad</span> /{" "}
          <span className="font-medium text-grey-700">Historial</span>
        </nav>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-500 border border-red-200 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-grey-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-grey-200">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 max-w-md rounded-xl border border-grey-200 focus-within:border-primary-400 transition-colors">
            <MagnifyingGlassIcon className="text-grey-300" />
            <input
              placeholder="Buscar por descripción..."
              className="text-sm w-full outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Tooltip.Provider>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={handleExportPDF}
                    disabled={loading || filtrados.length === 0}
                    className="p-2 rounded-lg border border-grey-200 hover:bg-grey-100 disabled:opacity-40"
                  >
                    <FileTextIcon className="w-4 h-4" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    sideOffset={4}
                    className="bg-grey-700 text-white text-xs px-2 py-1 rounded"
                  >
                    Exportar PDF
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={handleExportXLSX}
                    disabled={loading || filtrados.length === 0}
                    className="p-2 rounded-lg border border-grey-200 hover:bg-grey-100 disabled:opacity-40"
                  >
                    <DownloadIcon className="w-4 h-4 text-primary-500" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    sideOffset={4}
                    className="bg-grey-700 text-white text-xs px-2 py-1 rounded"
                  >
                    Exportar XLSX
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
            <NuevoAsientoDialog
              monedas={monedas}
              onGuardar={crearAsiento}
              saving={saving}
              toast={toast}
            />
          </div>
        </div>

        {/* Tabla header */}
        <div className="grid grid-cols-[0.8fr_2fr_1.5fr_1.5fr_0.5fr] px-5 py-3 bg-grey-100 border-b border-grey-200 text-[10px] font-bold text-grey-400 uppercase tracking-widest">
          <span>ID</span>
          <span>Descripción</span>
          <span>Fecha Asiento</span>
          <span>Monto Total</span>
          <span>Acciones</span>
        </div>

        {/* Filas */}
        <div className="divide-y divide-grey-200">
          {loading ? (
            <div className="p-16 flex flex-col items-center gap-3 text-grey-400">
              <UpdateIcon className="animate-spin w-6 h-6" />
              <p className="text-sm">Obteniendo registros...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <p className="p-10 text-center text-grey-400 text-sm">
              No hay registros disponibles.
            </p>
          ) : (
            filtrados.map((asiento) => (
              <div
                key={asiento.id}
                className="grid grid-cols-[0.8fr_2fr_1.5fr_1.5fr_0.5fr] items-center px-5 py-4 hover:bg-grey-50 transition-colors"
              >
                <span className="text-sm font-bold text-primary-500">
                  #{asiento.id}
                </span>
                <span className="text-sm text-grey-700 font-medium">
                  {asiento.descripcion}
                </span>
                <span className="text-sm text-grey-500">
                  {formatDateLocal(asiento.fechaAsiento)}
                </span>
                <span className="text-sm font-bold text-grey-700">
                  {formatMoney(asiento.montoTotal)}
                </span>
                <DetalleAsientoDialog
                  asientoId={asiento.id}
                  obtenerDetalle={obtenerDetalle}
                  toast={toast}
                >
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-100 text-grey-400 hover:text-primary-500 transition-colors cursor-pointer">
                    <EyeOpenIcon />
                  </button>
                </DetalleAsientoDialog>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
