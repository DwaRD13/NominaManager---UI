import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { utils, writeFile } from "xlsx";

// Colores de la paleta del proyecto (primary-400 = #008080, grey-700 = #111212)
const COLOR_PRIMARY = [0, 128, 128]; // #008080
const COLOR_GREY_700 = [17, 18, 18]; // #111212
const COLOR_GREY_400 = [112, 115, 115]; // #707373
const COLOR_GREY_100 = [224, 231, 231]; // #e0e7e7
const COLOR_WHITE = [255, 255, 255];

/**
 * Formatea un número como moneda DOP sin símbolo para el export
 * @param {number | null} valor
 */
function formatSalarioExport(valor) {
  if (valor == null) return "—";
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
  }).format(valor);
}

/**
 * Formatea una fecha ISO a string legible
 * @param {string | null} fecha
 */
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

/**
 * Exporta la lista de empleados a un archivo PDF.
 * @param {import('../types').Empleado[]} empleados
 * @param {{ titulo?: string, subtitulo?: string }} opciones
 */
export function exportarEmpleadosPDF(
  empleados,
  { titulo = "Listado de Empleados", subtitulo = "" } = {},
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const fechaGeneracion = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // ── Encabezado del documento ──
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, 297, 22, "F");

  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 14, 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Sistema de Nóminas — Generado el ${fechaGeneracion}`, 14, 16);

  if (subtitulo) {
    doc.text(subtitulo, 200, 16);
  }

  // ── Tabla ──
  const columnas = [
    { header: "Nombre", dataKey: "nombre" },
    { header: "Cédula", dataKey: "cedula" },
    { header: "Departamento", dataKey: "departamento" },
    { header: "Puesto", dataKey: "puesto" },
    { header: "Salario Mensual", dataKey: "salarioMensual" },
    { header: "Estado", dataKey: "estado" },
    { header: "Fecha de Alta", dataKey: "fechaCreacion" },
  ];

  const filas = empleados.map((emp) => ({
    nombre: emp.nombre ?? "—",
    cedula: emp.cedula ?? "—",
    departamento: emp.departamento ?? "—",
    puesto: emp.puesto ?? "—",
    salarioMensual: formatSalarioExport(emp.salarioMensual),
    estado: emp.estado ?? "—",
    fechaCreacion: formatFecha(emp.fechaCreacion),
  }));

  autoTable(doc, {
    columns: columnas,
    body: filas,
    startY: 26,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      valign: "middle",
      textColor: COLOR_GREY_700,
    },
    headStyles: {
      fillColor: COLOR_GREY_700,
      textColor: COLOR_WHITE,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: COLOR_GREY_100,
    },
    columnStyles: {
      salarioMensual: { halign: "right" },
      estado: { halign: "center" },
      fechaCreacion: { halign: "center" },
    },
    // Footer con número de página
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(7);
      doc.setTextColor(...COLOR_GREY_400);
      doc.text(
        `Página ${currentPage} de ${pageCount}  —  Total empleados: ${empleados.length}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 8,
      );
    },
  });

  doc.save(`empleados_${fechaGeneracion.replace(/\//g, "-")}.pdf`);
}

/**
 * Exporta la lista de empleados a un archivo XLSX.
 * @param {import('../types').Empleado[]} empleados
 * @param {{ nombreArchivo?: string }} opciones
 */
export function exportarEmpleadosXLSX(
  empleados,
  { nombreArchivo = "empleados" } = {},
) {
  const fechaGeneracion = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Mapeamos los datos a un formato legible con cabeceras en español
  const filas = empleados.map((emp) => ({
    Nombre: emp.nombre ?? "",
    Cédula: emp.cedula ?? "",
    Departamento: emp.departamento ?? "",
    Puesto: emp.puesto ?? "",
    "Salario Mensual": emp.salarioMensual ?? 0,
    "ID Nómina": emp.idNomina ?? "",
    Estado: emp.estado ?? "",
    "Fecha de Alta": formatFecha(emp.fechaCreacion),
  }));

  const ws = utils.json_to_sheet(filas);

  // Ancho de columnas
  ws["!cols"] = [
    { wch: 28 }, // Nombre
    { wch: 18 }, // Cédula
    { wch: 22 }, // Departamento
    { wch: 24 }, // Puesto
    { wch: 18 }, // Salario
    { wch: 12 }, // ID Nómina
    { wch: 12 }, // Estado
    { wch: 16 }, // Fecha
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Empleados");

  writeFile(wb, `${nombreArchivo}_${fechaGeneracion.replace(/\//g, "-")}.xlsx`);
}

/**
 * Exporta la lista de asientos contables a un archivo PDF.
 * @param {Array} asientos
 * @param {{ titulo?: string, subtitulo?: string }} opciones
 */
export function exportarAsientosPDF(
  asientos,
  { titulo = "Listado de Asientos Contables", subtitulo = "" } = {},
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const fechaGeneracion = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, 210, 24, "F");

  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 14, 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Sistema de Nóminas — Generado el ${fechaGeneracion}`, 14, 16);

  if (subtitulo) {
    doc.text(subtitulo, 14, 21);
  }

  const columnas = [
    { header: "ID", dataKey: "id" },
    { header: "Descripción", dataKey: "descripcion" },
    { header: "Fecha Asiento", dataKey: "fechaAsiento" },
    { header: "Monto Total", dataKey: "montoTotal" },
  ];

  const filas = asientos.map((a) => ({
    id: a.id ?? "—",
    descripcion: a.descripcion ?? "—",
    fechaAsiento: formatFecha(a.fechaAsiento ?? a.fechaInicio ?? a.fechaFin),
    montoTotal: formatSalarioExport(a.montoTotal ?? 0),
  }));

  autoTable(doc, {
    columns: columnas,
    body: filas,
    startY: subtitulo ? 26 : 24,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      valign: "middle",
      textColor: COLOR_GREY_700,
    },
    headStyles: {
      fillColor: COLOR_GREY_700,
      textColor: COLOR_WHITE,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: COLOR_GREY_100,
    },
    columnStyles: {
      id: { halign: "center", cellWidth: 18 },
      fechaAsiento: { halign: "center", cellWidth: 30 },
      montoTotal: { halign: "right", fontStyle: "bold", cellWidth: 30 },
    },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_GREY_400);
    doc.text(
      `Página ${i} de ${pageCount}  —  Total asientos: ${asientos.length}`,
      14,
      doc.internal.pageSize.height - 8,
    );
  }

  doc.save(`asientos_contables_${fechaGeneracion.replace(/\//g, "-")}.pdf`);
}

/**
 * Exporta la lista de asientos contables a un archivo XLSX.
 * @param {Array} asientos
 * @param {{ nombreArchivo?: string }} opciones
 */
export function exportarAsientosXLSX(
  asientos,
  { nombreArchivo = "asientos_contables" } = {},
) {
  const fechaGeneracion = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const filas = asientos.map((a) => ({
    ID: a.id ?? "",
    Descripción: a.descripcion ?? "",
    "Fecha Asiento": formatFecha(a.fechaAsiento ?? a.fechaInicio ?? a.fechaFin),
    "Monto Total": a.montoTotal ?? 0,
  }));

  const ws = utils.json_to_sheet(filas);
  ws["!cols"] = [
    { wch: 10 },
    { wch: 48 },
    { wch: 16 },
    { wch: 16 },
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Asientos");

  writeFile(wb, `${nombreArchivo}_${fechaGeneracion.replace(/\//g, "-")}.xlsx`);
}

/**
 * Exporta la lista de Tipos de Ingresos y Deducciones a un archivo PDF.
 * @param {Array} ingresos
 * @param {Array} deducciones
 * @param {{ titulo?: string, subtitulo?: string }} opciones
 */
export function exportarTiposPDF(
  ingresos,
  deducciones,
  { titulo = "Tipos de Ingresos y Deducciones", subtitulo = "" } = {},
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const fechaGeneracion = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // ── Encabezado del documento ──
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, 210, 22, "F");

  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 14, 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Sistema de Nóminas — Generado el ${fechaGeneracion}`, 14, 16);

  if (subtitulo) {
    doc.text(subtitulo, 150, 16);
  }

  // ── Tabla Ingresos ──
  doc.setTextColor(...COLOR_GREY_700);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Tipos de Ingresos", 14, 32);

  const columnas = [
    { header: "Nombre", dataKey: "nombre" },
    { header: "Tipo", dataKey: "tipo" },
    { header: "Estado", dataKey: "estado" },
  ];

  const filasIngresos = ingresos.map((item) => ({
    nombre: item.nombre ?? "—",
    tipo: item.dependeDeSalario ? "Gravable" : "No gravable",
    estado: item.estado ?? "—",
  }));

  autoTable(doc, {
    columns: columnas,
    body: filasIngresos,
    startY: 36,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      valign: "middle",
      textColor: COLOR_GREY_700,
    },
    headStyles: {
      fillColor: COLOR_GREY_700,
      textColor: COLOR_WHITE,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: COLOR_GREY_100,
    },
    columnStyles: {
      estado: { halign: "center" },
    },
  });

  const finalY = doc.lastAutoTable.finalY || 36;

  // ── Tabla Deducciones ──
  doc.setTextColor(...COLOR_GREY_700);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Tipos de Deducciones", 14, finalY + 12);

  const filasDeducciones = deducciones.map((item) => ({
    nombre: item.nombre ?? "—",
    tipo: item.dependeDeSalario ? "Gravable" : "No gravable",
    estado: item.estado ?? "—",
  }));

  autoTable(doc, {
    columns: columnas,
    body: filasDeducciones,
    startY: finalY + 16,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      valign: "middle",
      textColor: COLOR_GREY_700,
    },
    headStyles: {
      fillColor: COLOR_GREY_700,
      textColor: COLOR_WHITE,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: COLOR_GREY_100,
    },
    columnStyles: {
      estado: { halign: "center" },
    },
  });

  // Footer con número de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_GREY_400);
    doc.text(
      `Página ${i} de ${pageCount}  —  Ingresos: ${ingresos.length} / Deducciones: ${deducciones.length}`,
      14,
      doc.internal.pageSize.height - 8,
    );
  }

  doc.save(
    `tipos_ingresos_deducciones_${fechaGeneracion.replace(/\//g, "-")}.pdf`,
  );
}

/**
 * Exporta el reporte de Consultas Especiales a un archivo PDF.
 * @param {Array} resultados
 * @param {Array} empleados
 * @param {Object} filtros
 */
export function exportarConsultasPDF(resultados, empleados, filtros) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const fechaGeneracion = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // ── Encabezado del documento ──
  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Consultas Especiales", 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const empFiltro = filtros.empleadoId
    ? empleados.find((e) => e.id === Number(filtros.empleadoId))?.nombre
    : "Todos los colaboradores";
  const tipoFiltro =
    filtros.tipoTransaccion === "TODOS"
      ? "Ingresos y Deducciones"
      : filtros.tipoTransaccion === "INGRESO"
        ? "Solo Ingresos"
        : "Solo Deducciones";
  const fechasRango =
    filtros.fechaInicio && filtros.fechaFin
      ? `${formatFecha(filtros.fechaInicio)} al ${formatFecha(filtros.fechaFin)}`
      : "Histórico Completo";

  doc.text(
    `Filtros: ${empFiltro} | ${tipoFiltro} | Rango: ${fechasRango}`,
    14,
    18,
  );
  doc.text(`Generado el: ${fechaGeneracion}`, 14, 24);

  // ── Tabla de transacciones ──
  const columnas = [
    { header: "Fecha", dataKey: "fecha" },
    { header: "Colaborador", dataKey: "empleado" },
    { header: "Concepto (Tipo)", dataKey: "tipo" },
    { header: "Monto", dataKey: "monto" },
  ];

  let totalIngresos = 0;
  let totalDeducciones = 0;

  const getEmpleadoNombre = (id) =>
    empleados.find((e) => e.id === Number(id))?.nombre || `ID: ${id}`;

  const filas = resultados.map((r) => {
    const isIngreso = r.tipoTransaccion === "INGRESO";
    if (isIngreso) totalIngresos += r.monto;
    else totalDeducciones += r.monto;

    return {
      fecha: formatFecha(r.fecha),
      empleado: getEmpleadoNombre(r.empleadoId),
      tipo: `${r.tipoNombre}\n(${isIngreso ? "INGRESO" : "DEDUCCIÓN"})`,
      monto: `${isIngreso ? "+" : "-"}${formatSalarioExport(r.monto)}`,
    };
  });

  autoTable(doc, {
    columns: columnas,
    body: filas,
    startY: 36,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 4,
      valign: "middle",
      textColor: COLOR_GREY_700,
    },
    headStyles: {
      fillColor: COLOR_GREY_700,
      textColor: COLOR_WHITE,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: COLOR_GREY_100,
    },
    columnStyles: {
      monto: { halign: "right", fontStyle: "bold" },
      tipo: { halign: "center" },
    },
    didParseCell: function (data) {
      if (data.section === "body" && data.column.dataKey === "monto") {
        if (data.cell.raw.startsWith("+")) {
          data.cell.styles.textColor = [5, 150, 105]; // verde
        } else if (data.cell.raw.startsWith("-")) {
          data.cell.styles.textColor = [220, 38, 38]; // rojo
        }
      }
    },
  });

  // ── Resumen de totales al final ──
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setTextColor(...COLOR_GREY_700);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen del Reporte", 14, finalY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Total Ingresos (+): ${formatSalarioExport(totalIngresos)}`,
    14,
    finalY + 6,
  );
  doc.text(
    `Total Deducciones (-): ${formatSalarioExport(totalDeducciones)}`,
    14,
    finalY + 12,
  );

  const balance = totalIngresos - totalDeducciones;
  doc.setFont("helvetica", "bold");
  doc.text(
    `Balance Neto: ${balance >= 0 ? "+" : ""}${formatSalarioExport(balance)}`,
    14,
    finalY + 20,
  );

  // Footer con número de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_GREY_400);
    doc.text(
      `Página ${i} de ${pageCount}  —  Total registros: ${resultados.length}`,
      14,
      doc.internal.pageSize.height - 8,
    );
  }

  doc.save(`Reporte_Consultas_${fechaGeneracion.replace(/\//g, "-")}.pdf`);
}

/**
 * Exporta el reporte de Consultas Especiales a un archivo XLSX.
 * @param {Array} resultados
 * @param {Array} empleados
 * @param {Object} filtros
 * @param {{ nombreArchivo?: string }} opciones
 */
export function exportarConsultasXLSX(
  resultados,
  empleados,
  filtros,
  { nombreArchivo = "consultas_especiales" } = {},
) {
  const fechaGeneracion = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const getEmpleadoNombre = (id) =>
    empleados.find((e) => e.id === Number(id))?.nombre || `ID: ${id}`;

  const empFiltro = filtros.empleadoId
    ? empleados.find((e) => e.id === Number(filtros.empleadoId))?.nombre
    : "Todos los colaboradores";

  const tipoFiltro =
    filtros.tipoTransaccion === "TODOS"
      ? "Ingresos y Deducciones"
      : filtros.tipoTransaccion === "INGRESO"
        ? "Solo Ingresos"
        : "Solo Deducciones";

  const fechasRango =
    filtros.fechaInicio && filtros.fechaFin
      ? `${formatFecha(filtros.fechaInicio)} al ${formatFecha(filtros.fechaFin)}`
      : "Histórico Completo";

  let totalIngresos = 0;
  let totalDeducciones = 0;

  const filas = resultados.map((r) => {
    const esIngreso = r.tipoTransaccion === "INGRESO";
    if (esIngreso) totalIngresos += r.monto || 0;
    else totalDeducciones += r.monto || 0;

    return {
      Fecha: formatFecha(r.fecha),
      Colaborador: getEmpleadoNombre(r.empleadoId),
      Tipo: esIngreso ? "INGRESO" : "DEDUCCIÓN",
      Concepto: r.tipoNombre ?? "—",
      Monto: esIngreso ? r.monto || 0 : -(r.monto || 0),
      Estado: "Activo",
    };
  });

  const ws = utils.json_to_sheet(filas);
  ws["!cols"] = [
    { wch: 14 }, // Fecha
    { wch: 30 }, // Colaborador
    { wch: 14 }, // Tipo
    { wch: 34 }, // Concepto
    { wch: 16 }, // Monto
    { wch: 12 }, // Estado
  ];

  const resumen = [
    { Campo: "Filtro colaborador", Valor: empFiltro ?? "—" },
    { Campo: "Filtro tipo", Valor: tipoFiltro },
    { Campo: "Rango de fechas", Valor: fechasRango },
    { Campo: "Total registros", Valor: resultados.length },
    { Campo: "Total ingresos", Valor: totalIngresos },
    { Campo: "Total deducciones", Valor: totalDeducciones },
    { Campo: "Balance neto", Valor: totalIngresos - totalDeducciones },
    { Campo: "Generado el", Valor: fechaGeneracion },
  ];

  const wsResumen = utils.json_to_sheet(resumen);
  wsResumen["!cols"] = [
    { wch: 24 }, // Campo
    { wch: 48 }, // Valor
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Consultas");
  utils.book_append_sheet(wb, wsResumen, "Resumen");

  writeFile(wb, `${nombreArchivo}_${fechaGeneracion.replace(/\//g, "-")}.xlsx`);
}

/**
 * Exporta la lista de transacciones a un archivo PDF.
 * @param {Array} transacciones
 * @param {{ busqueda?: string, filtroTipo?: string, titulo?: string }} opciones
 */
export function exportarTransaccionesPDF(
  transacciones,
  { busqueda = "", filtroTipo = "todos", titulo = "Reporte de Transacciones" } = {},
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const fechaGeneracion = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  doc.setFillColor(...COLOR_PRIMARY);
  doc.rect(0, 0, 210, 24, "F");

  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 14, 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Sistema de Nóminas — Generado el ${fechaGeneracion}`, 14, 16);

  const tipoFiltro =
    filtroTipo === "todos"
      ? "Todas"
      : filtroTipo === "INGRESO"
        ? "Ingresos"
        : "Deducciones";

  const busquedaTexto = busqueda?.trim() ? busqueda.trim() : "(sin búsqueda)";
  doc.text(`Filtros: Tipo ${tipoFiltro} | Búsqueda: ${busquedaTexto}`, 14, 21);

  let totalIngresos = 0;
  let totalDeducciones = 0;

  const columnas = [
    { header: "Fecha", dataKey: "fecha" },
    { header: "Tipo", dataKey: "tipo" },
    { header: "Empleado", dataKey: "empleado" },
    { header: "Concepto", dataKey: "concepto" },
    { header: "Monto", dataKey: "monto" },
  ];

  const filas = transacciones.map((t) => {
    const esIngreso = t.estado?.toUpperCase() === "INGRESO";
    const montoValor = Number(t.monto || 0);

    if (esIngreso) totalIngresos += montoValor;
    else totalDeducciones += montoValor;

    return {
      fecha: formatFecha(t.fecha),
      tipo: t.estado ?? "—",
      empleado: t.nombreEmpleado ?? "—",
      concepto: t.tipo ?? "—",
      monto: `${esIngreso ? "+" : "-"}${formatSalarioExport(montoValor)}`,
    };
  });

  autoTable(doc, {
    columns: columnas,
    body: filas,
    startY: 28,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      valign: "middle",
      textColor: COLOR_GREY_700,
    },
    headStyles: {
      fillColor: COLOR_GREY_700,
      textColor: COLOR_WHITE,
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: COLOR_GREY_100,
    },
    columnStyles: {
      monto: { halign: "right", fontStyle: "bold" },
      tipo: { halign: "center" },
    },
    didParseCell: function (data) {
      if (data.section === "body" && data.column.dataKey === "monto") {
        if (String(data.cell.raw).startsWith("+")) {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (String(data.cell.raw).startsWith("-")) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
  });

  const finalY = (doc.lastAutoTable?.finalY || 28) + 8;
  const balance = totalIngresos - totalDeducciones;

  doc.setTextColor(...COLOR_GREY_700);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Resumen", 14, finalY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Total ingresos: ${formatSalarioExport(totalIngresos)}`, 14, finalY + 6);
  doc.text(`Total deducciones: ${formatSalarioExport(totalDeducciones)}`, 14, finalY + 12);

  doc.setFont("helvetica", "bold");
  doc.text(
    `Balance neto: ${balance >= 0 ? "+" : ""}${formatSalarioExport(balance)}`,
    14,
    finalY + 18,
  );

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(...COLOR_GREY_400);
    doc.text(
      `Página ${i} de ${pageCount}  —  Total transacciones: ${transacciones.length}`,
      14,
      doc.internal.pageSize.height - 8,
    );
  }

  doc.save(`transacciones_${fechaGeneracion.replace(/\//g, "-")}.pdf`);
}

/**
 * Exporta la lista de transacciones a un archivo XLSX.
 * @param {Array} transacciones
 * @param {{ busqueda?: string, filtroTipo?: string, nombreArchivo?: string }} opciones
 */
export function exportarTransaccionesXLSX(
  transacciones,
  { busqueda = "", filtroTipo = "todos", nombreArchivo = "transacciones" } = {},
) {
  const fechaGeneracion = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const filas = transacciones.map((t) => {
    const esIngreso = t.estado?.toUpperCase() === "INGRESO";
    const montoValor = Number(t.monto || 0);

    return {
      Fecha: formatFecha(t.fecha),
      Tipo: t.estado ?? "",
      Empleado: t.nombreEmpleado ?? "",
      Concepto: t.tipo ?? "",
      Monto: esIngreso ? montoValor : -montoValor,
      "Depende de salario": t.dependeDeSalario ? "Sí" : "No",
    };
  });

  const ws = utils.json_to_sheet(filas);
  ws["!cols"] = [
    { wch: 14 }, // Fecha
    { wch: 14 }, // Tipo
    { wch: 28 }, // Empleado
    { wch: 30 }, // Concepto
    { wch: 16 }, // Monto
    { wch: 20 }, // Depende de salario
  ];

  const tipoFiltro =
    filtroTipo === "todos"
      ? "Todas"
      : filtroTipo === "INGRESO"
        ? "Ingresos"
        : "Deducciones";

  const resumen = [
    { Campo: "Filtro tipo", Valor: tipoFiltro },
    { Campo: "Búsqueda", Valor: busqueda?.trim() || "(sin búsqueda)" },
    { Campo: "Total transacciones", Valor: transacciones.length },
    { Campo: "Generado el", Valor: fechaGeneracion },
  ];

  const wsResumen = utils.json_to_sheet(resumen);
  wsResumen["!cols"] = [
    { wch: 24 },
    { wch: 42 },
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Transacciones");
  utils.book_append_sheet(wb, wsResumen, "Resumen");

  writeFile(wb, `${nombreArchivo}_${fechaGeneracion.replace(/\//g, "-")}.xlsx`);
}

/**
 * Exporta la lista de Tipos de Ingresos y Deducciones a un archivo XLSX.
 * @param {Array} ingresos
 * @param {Array} deducciones
 * @param {{ nombreArchivo?: string }} opciones
 */
export function exportarTiposXLSX(
  ingresos,
  deducciones,
  { nombreArchivo = "tipos_ingresos_deducciones" } = {},
) {
  const fechaGeneracion = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // ── Hoja Ingresos ──
  const filasIngresos = ingresos.map((item) => ({
    Nombre: item.nombre ?? "",
    Tipo: item.dependeDeSalario ? "Gravable" : "No gravable",
    Estado: item.estado ?? "",
  }));

  const wsIngresos = utils.json_to_sheet(filasIngresos);
  wsIngresos["!cols"] = [
    { wch: 35 }, // Nombre
    { wch: 15 }, // Tipo
    { wch: 12 }, // Estado
  ];

  // ── Hoja Deducciones ──
  const filasDeducciones = deducciones.map((item) => ({
    Nombre: item.nombre ?? "",
    Tipo: item.dependeDeSalario ? "Gravable" : "No gravable",
    Estado: item.estado ?? "",
  }));

  const wsDeducciones = utils.json_to_sheet(filasDeducciones);
  wsDeducciones["!cols"] = [
    { wch: 35 }, // Nombre
    { wch: 15 }, // Tipo
    { wch: 12 }, // Estado
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, wsIngresos, "Ingresos");
  utils.book_append_sheet(wb, wsDeducciones, "Deducciones");

  writeFile(wb, `${nombreArchivo}_${fechaGeneracion.replace(/\//g, "-")}.xlsx`);
}
