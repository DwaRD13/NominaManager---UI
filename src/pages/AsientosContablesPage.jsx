import { useState } from "react";
import { Dialog, Select, Separator } from "radix-ui";
import {
  PlusIcon,
  ChevronDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  UpdateIcon,
} from "@radix-ui/react-icons";
import { useToast } from "../hooks/useToast.jsx";

const PAGE_SIZE = 8;

const MONEDAS_MOCK = [
  { value: "DOP", label: "Peso Dominicano (DOP)" },
  { value: "USD", label: "Dólar Estadounidense (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
];

const ASIENTOS_INICIALES = [
  {
    id: 1,
    descripcion: "Asiento generado para nómina quincenal",
    fechaAsiento: "2026-04-01",
    montoTotal: 245000.0,
    estado: 1,
    idAsientoContable: 1001,
    moneda: "DOP",
  },
  {
    id: 2,
    descripcion: "Asiento de cierre mensual",
    fechaAsiento: "2026-03-31",
    montoTotal: 489500.0,
    estado: 1,
    idAsientoContable: 1002,
    moneda: "DOP",
  },
];

function formatFecha(fecha) {
  if (!fecha) return "—";
  try {
    return new Date(fecha).toLocaleDateString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return fecha;
  }
}

function formatMonto(valor, moneda = "DOP") {
  if (valor == null) return "—";
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 2,
  }).format(valor);
}

function EstadoBadge({ estado }) {
  const activo = String(estado) === "1";
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-semibold w-fit ${
        activo ? "bg-primary-100 text-primary-500" : "bg-grey-200 text-grey-500"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}

function CrearAsientoDialog({ onCrear, saving }) {
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [form, setForm] = useState({
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    moneda: "DOP",
  });

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen);
    if (nextOpen) {
      setFormError(null);
      return;
    }

    setForm({ descripcion: "", fechaInicio: "", fechaFin: "", moneda: "DOP" });
    setFormError(null);
  }

  async function handleCrear() {
    if (!form.fechaInicio || !form.fechaFin) {
      setFormError("Debes seleccionar un rango de fechas.");
      return;
    }

    if (form.fechaInicio > form.fechaFin) {
      setFormError("La fecha inicial no puede ser mayor que la fecha final.");
      return;
    }

    try {
      setFormError(null);
      await onCrear(form);
      setOpen(false);
    } catch (e) {
      setFormError(e.message);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-400 rounded-xl hover:bg-primary-500 transition-colors cursor-pointer shrink-0"
          style={{ boxShadow: "0px 2px 8px 0px rgba(0,128,128,0.20)" }}
        >
          <PlusIcon />
          Nuevo Asiento
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl border border-grey-200 p-6 w-full max-w-lg flex flex-col gap-5 focus:outline-none"
          style={{ boxShadow: "0px 8px 32px 0px rgba(0,0,0,0.12)" }}
        >
          {/* ── Header ── */}
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-xl font-bold text-grey-700">
              Crear Asiento Contable
            </Dialog.Title>
            <Dialog.Description className="text-sm text-grey-400">
              Seleccioná rango de fechas y moneda para generar el asiento.
            </Dialog.Description>
          </div>

          <Separator.Root className="h-px bg-grey-200" />

          {/* ── Formulario ── */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">Descripción</label>
              <input
                type="text"
                maxLength={50}
                value={form.descripcion}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, descripcion: e.target.value }))
                }
                placeholder="Ej: Asiento de cierre quincenal"
                className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 placeholder:text-grey-300 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">
                  Fecha inicio *
                </label>
                <input
                  type="date"
                  value={form.fechaInicio}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fechaInicio: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-grey-600">
                  Fecha fin *
                </label>
                <input
                  type="date"
                  value={form.fechaFin}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fechaFin: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-grey-600">Moneda *</label>
              <Select.Root
                value={form.moneda}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, moneda: value }))
                }
              >
                <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border border-grey-200 bg-white text-grey-700 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer">
                  <Select.Value />
                  <Select.Icon>
                    <ChevronDownIcon className="text-grey-400" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content
                    className="bg-white border border-grey-200 rounded-lg overflow-hidden z-50"
                    style={{ boxShadow: "0px 4px 16px 0px rgba(0,0,0,0.08)" }}
                    position="popper"
                    sideOffset={4}
                  >
                    <Select.Viewport className="p-1">
                      {MONEDAS_MOCK.map((moneda) => (
                        <Select.Item
                          key={moneda.value}
                          value={moneda.value}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-grey-700 rounded cursor-pointer hover:bg-primary-100 hover:text-primary-500 focus:outline-none focus:bg-primary-100 focus:text-primary-500"
                        >
                          <Select.ItemIndicator>
                            <CheckIcon className="text-primary-400 w-3 h-3" />
                          </Select.ItemIndicator>
                          <Select.ItemText>{moneda.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {formError && <p className="text-xs text-red-500 font-medium">{formError}</p>}
          </div>

          {/* ── Acciones ── */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Dialog.Close asChild>
              <button
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-grey-500 rounded-lg border border-grey-200 hover:bg-grey-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
            </Dialog.Close>

            <button
              onClick={handleCrear}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-400 rounded-lg hover:bg-primary-500 transition-colors cursor-pointer disabled:opacity-60"
              style={{ boxShadow: "0px 2px 8px 0px rgba(0,128,128,0.20)" }}
            >
              {saving && <UpdateIcon className="animate-spin" />}
              Generar Asiento
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AsientosContablesPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [asientos, setAsientos] = useState(ASIENTOS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const filtrados = asientos.filter((a) => {
    const texto = busqueda.trim().toLowerCase();
    const matchBusqueda =
      texto === "" ||
      a.descripcion?.toLowerCase().includes(texto) ||
      String(a.idAsientoContable).includes(texto) ||
      String(a.id).includes(texto);

    const matchEstado =
      filtroEstado === "todos" || String(a.estado) === String(filtroEstado);

    return matchBusqueda && matchEstado;
  });

  const totalAsientos = filtrados.length;
  const totalPaginas = Math.max(1, Math.ceil(totalAsientos / PAGE_SIZE));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const rangoDesde = totalAsientos === 0 ? 0 : (paginaSegura - 1) * PAGE_SIZE + 1;
  const rangoHasta = Math.min(paginaSegura * PAGE_SIZE, totalAsientos);
  const visibles = filtrados.slice(
    (paginaSegura - 1) * PAGE_SIZE,
    paginaSegura * PAGE_SIZE,
  );

  function calcularMontoSimulado(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffMs = Math.max(0, fin - inicio);
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return Number((dias * 8250.75).toFixed(2));
  }

  async function handleCrearAsiento({ descripcion, fechaInicio, fechaFin, moneda }) {
    setSaving(true);
    try {
      const nextId = asientos.length > 0 ? Math.max(...asientos.map((a) => a.id)) + 1 : 1;
      const montoTotal = calcularMontoSimulado(fechaInicio, fechaFin);

      const nuevoAsiento = {
        id: nextId,
        descripcion:
          descripcion?.trim() ||
          `Asiento generado del ${formatFecha(fechaInicio)} al ${formatFecha(fechaFin)}`,
        fechaAsiento: fechaFin,
        montoTotal,
        estado: 1,
        idAsientoContable: 1000 + nextId,
        moneda,
      };

      setAsientos((prev) => [nuevoAsiento, ...prev]);
      setPagina(1);

      toast({
        title: "Asiento generado",
        description: `Se creó el asiento ${nuevoAsiento.idAsientoContable} en ${moneda}.`,
        variant: "success",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Body ── */}
      <div className="flex flex-col gap-6 px-8 pt-4 pb-8">
        {/* ── Título + breadcrumbs ── */}
        <div className="flex flex-col gap-1 pt-10">
          <h1 className="m-0 text-3xl font-bold text-grey-700">Asiento Contable</h1>
          <nav className="flex items-center gap-1 text-sm">
            <span className="text-grey-400">Dashboard</span>
            <span className="text-grey-400">/</span>
            <span className="font-medium text-grey-700">Asiento Contable</span>
          </nav>
        </div>

        {/* ── Tabla ── */}
        <div
          className="bg-white rounded-xl border border-grey-200 overflow-hidden"
          style={{ boxShadow: "0px 4px 16px 0px rgba(0,0,0,0.04)" }}
        >
          {/* ── Toolbar ── */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-grey-200">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-grey-200 bg-white focus-within:border-primary-400 transition-colors">
              <FileTextIcon className="text-grey-300 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
                placeholder="Buscar por descripción o referencia..."
                className="flex-1 text-sm bg-transparent text-grey-700 placeholder:text-grey-300 focus:outline-none"
              />
            </div>

            <Select.Root
              value={filtroEstado}
              onValueChange={(value) => {
                setFiltroEstado(value);
                setPagina(1);
              }}
            >
              <Select.Trigger className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-grey-200 bg-white text-grey-500 hover:border-primary-300 focus:outline-none focus:border-primary-400 transition-colors cursor-pointer min-w-36">
                <Select.Value placeholder="Estado" />
                <Select.Icon className="ml-auto">
                  <ChevronDownIcon className="text-grey-400" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content
                  className="bg-white border border-grey-200 rounded-xl overflow-hidden z-50"
                  style={{ boxShadow: "0px 4px 16px 0px rgba(0,0,0,0.08)" }}
                  position="popper"
                  sideOffset={4}
                >
                  <Select.Viewport className="p-1">
                    {[
                      { value: "todos", label: "Todos" },
                      { value: "1", label: "Activos" },
                      { value: "0", label: "Inactivos" },
                    ].map((opt) => (
                      <Select.Item
                        key={opt.value}
                        value={opt.value}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-grey-700 rounded cursor-pointer hover:bg-primary-100 hover:text-primary-500 focus:outline-none focus:bg-primary-100 focus:text-primary-500"
                      >
                        <Select.ItemIndicator>
                          <CheckIcon className="text-primary-400 w-3 h-3" />
                        </Select.ItemIndicator>
                        <Select.ItemText>{opt.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>

            <CrearAsientoDialog onCrear={handleCrearAsiento} saving={saving} />
          </div>

          {/* ── Cabecera de columnas ── */}
          <div
            className="grid items-center px-5 py-3 bg-grey-100 border-b border-grey-200"
            style={{ gridTemplateColumns: "0.6fr 2fr 1fr 1.1fr 0.8fr 1fr" }}
          >
            {["ID", "Descripción", "Fecha Asiento", "Monto Total", "Estado", "Ref."].map((col) => (
              <span key={col} className="text-xs font-semibold text-grey-400 uppercase tracking-wide">
                {col}
              </span>
            ))}
          </div>

          {/* ── Filas ── */}
          {visibles.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-grey-400">
              <span className="text-sm font-medium">
                {busqueda || filtroEstado !== "todos"
                  ? "No se encontraron asientos contables con esos filtros."
                  : "No hay asientos contables registrados aún."}
              </span>
            </div>
          ) : (
            visibles.map((a, idx) => (
              <div key={a.id}>
                <div
                  className="grid items-center px-5 py-3 hover:bg-grey-100 transition-colors"
                  style={{ gridTemplateColumns: "0.6fr 2fr 1fr 1.1fr 0.8fr 1fr" }}
                >
                  <span className="text-sm font-semibold text-grey-700">{a.id}</span>
                  <span className="text-sm text-grey-600">{a.descripcion}</span>
                  <span className="text-sm text-grey-600">{formatFecha(a.fechaAsiento)}</span>
                  <span className="text-sm font-semibold text-grey-700">
                    {formatMonto(a.montoTotal, a.moneda)}
                  </span>
                  <EstadoBadge estado={a.estado} />
                  <span className="text-sm text-grey-500">{a.idAsientoContable}</span>
                </div>

                {idx < visibles.length - 1 && <Separator.Root className="h-px bg-grey-200 mx-5" />}
              </div>
            ))
          )}

          {/* ── Footer: paginación ── */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-grey-200">
            <span className="text-xs text-grey-400">
              {totalAsientos === 0 ? (
                "Sin resultados"
              ) : (
                <>
                  Mostrando <span className="font-semibold text-grey-700">{rangoDesde}–{rangoHasta}</span> de{" "}
                  <span className="font-semibold text-grey-700">{totalAsientos}</span> asientos
                </>
              )}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina(Math.max(1, paginaSegura - 1))}
                disabled={paginaSegura === 1}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-grey-200 text-grey-400 hover:bg-grey-100 hover:text-grey-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPagina(p)}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    p === paginaSegura
                      ? "bg-primary-400 text-white"
                      : "border border-grey-200 text-grey-500 hover:bg-grey-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPagina(Math.min(totalPaginas, paginaSegura + 1))}
                disabled={paginaSegura === totalPaginas}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-grey-200 text-grey-400 hover:bg-grey-100 hover:text-grey-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AsientosContablesPage;
