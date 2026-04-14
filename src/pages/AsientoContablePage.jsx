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

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-DO");
  };
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
        "Monto Total Transacción",
        "Monto Total en RD$",
        "ID Contabilidad",
      ],
    ],
    body: asientos.map((a) => [
      a.id,
      a.descripcion,
      a.moneda || "—",
      formatDate(a.fechaInicio),
      formatDate(a.fechaFin),
      formatMoney(a.montoTotalTransaccion),
      formatMoney(a.montoTotalDop),
      a.idContabilidad,
    ]),
  });
  doc.save("asientos_contables.pdf");
}

async function exportarXLSX(asientos) {
  const XLSX = await import("xlsx");
  const data = asientos.map((a) => ({
    ID: a.id,
    Descripción: a.descripcion,
    Moneda: a.moneda || "—",
    "Fecha Inicio": new Date(a.fechaInicio).toLocaleDateString("es-DO"),
    "Fecha Fin": new Date(a.fechaFin).toLocaleDateString("es-DO"),
    "Monto Total Transacción": a.montoTotalTransaccion,
    "Monto Total en RD$": a.montoTotalDop,
    "ID Contabilidad": a.idContabilidad || "—",
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

const formatMoneyGeneral = (val) => new Intl.NumberFormat().format(val ?? 0);
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
const GRID_LAYOUT = "grid-cols-[0.6fr_2fr_1.2fr_1.2fr_1fr_0.6fr]";

// ──────────────────────────────────────────────────────────────────
// Diálogo para ver detalles
// ──────────────────────────────────────────────────────────────────
function DetalleAsientoDialog({ asientoId, obtenerDetalle, toast, children }) {
  const [open, setOpen] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState(null);

  const handleOpenChange = async (isOpen) => {
    setOpen(isOpen);
    if (isOpen && asientoId) {
      setCargando(true);
      setErrorDetalle(null);
      try {
        const data = await obtenerDetalle(asientoId);
        setDetalle(data);
      } catch (err) {
        setErrorDetalle(err.message);
        toast({ title: "Error", description: err.message, variant: "error" });
      } finally {
        setCargando(false);
      }
    }
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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
          <Dialog.Title className="text-xl font-bold text-grey-700">
            Detalle del Asiento {detalle?.id && `#${detalle.id}`}
          </Dialog.Title>
          <Separator.Root className="h-px bg-grey-200 my-4" />

          {cargando && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <UpdateIcon className="animate-spin w-10 h-10 text-primary-400" />
              <p className="text-grey-400 text-sm animate-pulse">
                Cargando transacciones...
              </p>
            </div>
          )}

          {!cargando && detalle && (
            <div className="flex flex-col gap-6 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-grey-50 p-4 rounded-xl border border-grey-100">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-grey-400">
                    Descripción
                  </span>
                  <span className="font-medium">{detalle.descripcion}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-grey-400">
                    Fecha Asiento
                  </span>
                  <span>{formatDateLocal(detalle.fechaAsiento)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-grey-400">
                    ID Contabilidad
                  </span>
                  <span className="font-mono font-bold text-primary-600">
                    {detalle.idContabilidad || "Pendiente"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-grey-400">
                    Monto Original
                  </span>
                  <span className="font-bold text-grey-700">
                    {detalle.moneda}{" "}
                    {formatMoneyGeneral(detalle.montoTotalTransaccion)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-grey-400">
                    Total en RD$
                  </span>
                  <span className="font-bold text-green-600">
                    {formatMoney(detalle.montoTotalDop)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-grey-400">
                    Estado
                  </span>
                  <span
                    className={`font-semibold ${detalle.estado ? "text-green-500" : "text-red-500"}`}
                  >
                    {detalle.estado ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-grey-700 mb-3 flex items-center gap-2">
                  Transacciones vinculadas
                  <span className="px-2 py-0.5 bg-grey-100 text-grey-500 rounded-full text-[10px]">
                    {detalle.registroTransaccion?.length || 0}
                  </span>
                </h3>
                <div className="border border-grey-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="min-w-full text-xs">
                    <thead className="bg-grey-100 border-b border-grey-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-grey-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-grey-500 uppercase tracking-wider">
                          Concepto
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-grey-500 uppercase tracking-wider">
                          Empleado
                        </th>
                        <th className="px-4 py-3 text-right font-bold text-grey-500 uppercase tracking-wider">
                          Monto
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-grey-100">
                      {detalle.registroTransaccion?.map((t, idx) => {
                        const esIngreso = !!t.tipoDeIngreso;
                        return (
                          <tr
                            key={idx}
                            className="hover:bg-grey-50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-md font-bold text-[9px] uppercase ${
                                  esIngreso
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {esIngreso ? "Ingreso" : "Deducción"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-grey-700 font-medium">
                              {t.tipoTransaccion ||
                                t.tipoDeIngresonombre ||
                                t.tipoDeDeduccion?.nombre ||
                                "—"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-grey-700">
                                  {t.empleado?.nombre || "—"}
                                </span>
                                <span className="text-[10px] text-grey-400">
                                  {t.empleado?.cedula}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-grey-700">
                              {formatMoney(t.monto)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-8">
            <Dialog.Close asChild>
              <button className="px-6 py-2 text-sm font-semibold text-grey-500 rounded-xl border border-grey-200 hover:bg-grey-100 transition-colors cursor-pointer">
                Cerrar Detalle
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ──────────────────────────────────────────────────────────────────
// Componente Principal
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

  return (
    <div className="flex flex-col gap-6 px-8 pt-10 pb-8 min-h-screen bg-grey-50">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-grey-700">
            Asientos Contables
          </h1>
          <nav className="flex items-center gap-1 text-sm text-grey-400">
            <span>Contabilidad</span> /{" "}
            <span className="font-medium text-grey-700">
              Historial de Asientos
            </span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-grey-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-grey-200 bg-white">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 max-w-md rounded-xl border border-grey-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
            <MagnifyingGlassIcon className="text-grey-300 w-5 h-5" />
            <input
              placeholder="Buscar por descripción..."
              className="text-sm w-full outline-none"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportarPDF(filtrados)}
              disabled={loading || filtrados.length === 0}
              className="p-2.5 rounded-xl border border-grey-200 hover:bg-grey-50 text-grey-600 disabled:opacity-40 transition-colors cursor-pointer"
              title="Exportar PDF"
            >
              <FileTextIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => exportarXLSX(filtrados)}
              disabled={loading || filtrados.length === 0}
              className="p-2.5 rounded-xl border border-grey-200 hover:bg-grey-50 text-green-600 disabled:opacity-40 transition-colors cursor-pointer"
              title="Exportar Excel"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>

            <NuevoAsientoDialog
              monedas={monedas}
              onGuardar={crearAsiento}
              saving={saving}
              toast={toast}
            />
          </div>
        </div>

        {/* Tabla Header - Usando GRID_LAYOUT constante */}
        <div
          className={`grid ${GRID_LAYOUT} px-5 py-4 bg-grey-50 border-b border-grey-200 text-[10px] font-bold text-grey-400 uppercase tracking-widest`}
        >
          <span>ID Interno</span>
          <span>Descripción</span>
          <span>Fecha Asiento</span>
          <span>Monto Total</span>
          <span>ID Contabilidad</span>
          <span className="text-right px-2">Acciones</span>
        </div>

        {/* Filas */}
        <div className="divide-y divide-grey-100">
          {loading ? (
            <div className="p-20 flex flex-col items-center gap-3 text-grey-400">
              <UpdateIcon className="animate-spin w-8 h-8 text-primary-400" />
              <p className="text-sm font-medium">
                Cargando historial contable...
              </p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-grey-400 text-sm italic">
                No se encontraron registros que coincidan.
              </p>
            </div>
          ) : (
            filtrados.map((asiento) => (
              <div
                key={asiento.id}
                className={`grid ${GRID_LAYOUT} items-center px-5 py-4 hover:bg-primary-50/30 transition-colors group`}
              >
                <span className="text-sm font-bold text-primary-500">
                  #{asiento.id}
                </span>
                <span className="text-sm text-grey-700 font-semibold truncate pr-4">
                  {asiento.descripcion}
                </span>
                <span className="text-sm text-grey-500">
                  {formatDateLocal(asiento.fechaAsiento)}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-grey-700">
                    {asiento.moneda}{" "}
                    {formatMoneyGeneral(asiento.montoTotalTransaccion)}
                  </span>
                  <span className="text-[10px] text-grey-400">
                    Eq: {formatMoney(asiento.montoTotalDop)}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-grey-500 bg-grey-100 px-2 py-1 rounded w-fit">
                  {asiento.idContabilidad || "---"}
                </span>
                <div className="flex justify-end">
                  <DetalleAsientoDialog
                    asientoId={asiento.id}
                    obtenerDetalle={obtenerDetalle}
                    toast={toast}
                  >
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-grey-200 shadow-sm text-grey-400 group-hover:text-primary-500 group-hover:border-primary-200 transition-all hover:scale-110 cursor-pointer">
                      <EyeOpenIcon className="w-5 h-5" />
                    </button>
                  </DetalleAsientoDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
