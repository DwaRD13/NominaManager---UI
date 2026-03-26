import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { utils, writeFile } from 'xlsx'

// Colores de la paleta del proyecto (primary-400 = #008080, grey-700 = #111212)
const COLOR_PRIMARY = [0, 128, 128]     // #008080
const COLOR_GREY_700 = [17, 18, 18]     // #111212
const COLOR_GREY_400 = [112, 115, 115]  // #707373
const COLOR_GREY_100 = [224, 231, 231]  // #e0e7e7
const COLOR_WHITE = [255, 255, 255]

/**
 * Formatea un número como moneda DOP sin símbolo para el export
 * @param {number | null} valor
 */
function formatSalarioExport(valor) {
  if (valor == null) return '—'
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
  }).format(valor)
}

/**
 * Formatea una fecha ISO a string legible
 * @param {string | null} fecha
 */
function formatFecha(fecha) {
  if (!fecha) return '—'
  try {
    return new Date(fecha).toLocaleDateString('es-DO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return fecha
  }
}

/**
 * Exporta la lista de empleados a un archivo PDF.
 * @param {import('../types').Empleado[]} empleados
 * @param {{ titulo?: string, subtitulo?: string }} opciones
 */
export function exportarEmpleadosPDF(empleados, { titulo = 'Listado de Empleados', subtitulo = '' } = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const fechaGeneracion = new Date().toLocaleDateString('es-DO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  // ── Encabezado del documento ──
  doc.setFillColor(...COLOR_PRIMARY)
  doc.rect(0, 0, 297, 22, 'F')

  doc.setTextColor(...COLOR_WHITE)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(titulo, 14, 10)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Sistema de Nóminas — Generado el ${fechaGeneracion}`, 14, 16)

  if (subtitulo) {
    doc.text(subtitulo, 200, 16)
  }

  // ── Tabla ──
  const columnas = [
    { header: 'Nombre',           dataKey: 'nombre' },
    { header: 'Cédula',           dataKey: 'cedula' },
    { header: 'Departamento',     dataKey: 'departamento' },
    { header: 'Puesto',           dataKey: 'puesto' },
    { header: 'Salario Mensual',  dataKey: 'salarioMensual' },
    { header: 'Estado',           dataKey: 'estado' },
    { header: 'Fecha de Alta',    dataKey: 'fechaCreacion' },
  ]

  const filas = empleados.map((emp) => ({
    nombre:        emp.nombre ?? '—',
    cedula:        emp.cedula ?? '—',
    departamento:  emp.departamento ?? '—',
    puesto:        emp.puesto ?? '—',
    salarioMensual: formatSalarioExport(emp.salarioMensual),
    estado:        emp.estado ?? '—',
    fechaCreacion: formatFecha(emp.fechaCreacion),
  }))

  autoTable(doc, {
    columns: columnas,
    body: filas,
    startY: 26,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
      textColor: COLOR_GREY_700,
    },
    headStyles: {
      fillColor: COLOR_GREY_700,
      textColor: COLOR_WHITE,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: COLOR_GREY_100,
    },
    columnStyles: {
      salarioMensual: { halign: 'right' },
      estado: { halign: 'center' },
      fechaCreacion: { halign: 'center' },
    },
    // Footer con número de página
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages()
      const currentPage = doc.internal.getCurrentPageInfo().pageNumber
      doc.setFontSize(7)
      doc.setTextColor(...COLOR_GREY_400)
      doc.text(
        `Página ${currentPage} de ${pageCount}  —  Total empleados: ${empleados.length}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 8,
      )
    },
  })

  doc.save(`empleados_${fechaGeneracion.replace(/\//g, '-')}.pdf`)
}

/**
 * Exporta la lista de empleados a un archivo XLSX.
 * @param {import('../types').Empleado[]} empleados
 * @param {{ nombreArchivo?: string }} opciones
 */
export function exportarEmpleadosXLSX(empleados, { nombreArchivo = 'empleados' } = {}) {
  const fechaGeneracion = new Date().toLocaleDateString('es-DO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  // Mapeamos los datos a un formato legible con cabeceras en español
  const filas = empleados.map((emp) => ({
    'Nombre':          emp.nombre ?? '',
    'Cédula':          emp.cedula ?? '',
    'Departamento':    emp.departamento ?? '',
    'Puesto':          emp.puesto ?? '',
    'Salario Mensual': emp.salarioMensual ?? 0,
    'ID Nómina':       emp.idNomina ?? '',
    'Estado':          emp.estado ?? '',
    'Fecha de Alta':   formatFecha(emp.fechaCreacion),
  }))

  const ws = utils.json_to_sheet(filas)

  // Ancho de columnas
  ws['!cols'] = [
    { wch: 28 }, // Nombre
    { wch: 18 }, // Cédula
    { wch: 22 }, // Departamento
    { wch: 24 }, // Puesto
    { wch: 18 }, // Salario
    { wch: 12 }, // ID Nómina
    { wch: 12 }, // Estado
    { wch: 16 }, // Fecha
  ]

  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Empleados')

  writeFile(wb, `${nombreArchivo}_${fechaGeneracion.replace(/\//g, '-')}.xlsx`)
}

/**
 * Formatea un número como porcentaje
 * @param {number | null} valor
 */
function formatPorcentaje(valor) {
  if (valor == null || valor === undefined) return '—'
  return `${valor}%`
}

/**
 * Exporta la lista de Tipos de Ingresos y Deducciones a un archivo PDF.
 * @param {Array} ingresos
 * @param {Array} deducciones
 * @param {{ titulo?: string, subtitulo?: string }} opciones
 */
export function exportarTiposPDF(ingresos, deducciones, { titulo = 'Tipos de Ingresos y Deducciones', subtitulo = '' } = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const fechaGeneracion = new Date().toLocaleDateString('es-DO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  // ── Encabezado del documento ──
  doc.setFillColor(...COLOR_PRIMARY)
  doc.rect(0, 0, 210, 22, 'F')

  doc.setTextColor(...COLOR_WHITE)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(titulo, 14, 10)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Sistema de Nóminas — Generado el ${fechaGeneracion}`, 14, 16)

  if (subtitulo) {
    doc.text(subtitulo, 150, 16)
  }

  // ── Tabla Ingresos ──
  doc.setTextColor(...COLOR_GREY_700)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Tipos de Ingresos', 14, 32)

  const columnas = [
    { header: 'Nombre', dataKey: 'nombre' },
    { header: 'Tipo', dataKey: 'tipo' },
    { header: 'Porcentaje', dataKey: 'porcentaje' },
    { header: 'Estado', dataKey: 'estado' },
  ]

  const filasIngresos = ingresos.map((item) => ({
    nombre: item.nombre ?? '—',
    tipo: item.dependeDeSalario ? 'Gravable' : 'No gravable',
    porcentaje: formatPorcentaje(item.porcentaje),
    estado: item.estado ?? '—',
  }))

  autoTable(doc, {
    columns: columnas,
    body: filasIngresos,
    startY: 36,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
      textColor: COLOR_GREY_700,
    },
    headStyles: {
      fillColor: COLOR_GREY_700,
      textColor: COLOR_WHITE,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: COLOR_GREY_100,
    },
    columnStyles: {
      porcentaje: { halign: 'center' },
      estado: { halign: 'center' },
    },
  })

  const finalY = doc.lastAutoTable.finalY || 36

  // ── Tabla Deducciones ──
  doc.setTextColor(...COLOR_GREY_700)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Tipos de Deducciones', 14, finalY + 12)

  const filasDeducciones = deducciones.map((item) => ({
    nombre: item.nombre ?? '—',
    tipo: item.dependeDeSalario ? 'Gravable' : 'No gravable',
    porcentaje: formatPorcentaje(item.porcentaje),
    estado: item.estado ?? '—',
  }))

  autoTable(doc, {
    columns: columnas,
    body: filasDeducciones,
    startY: finalY + 16,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      valign: 'middle',
      textColor: COLOR_GREY_700,
    },
    headStyles: {
      fillColor: COLOR_GREY_700,
      textColor: COLOR_WHITE,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: COLOR_GREY_100,
    },
    columnStyles: {
      porcentaje: { halign: 'center' },
      estado: { halign: 'center' },
    },
  })

  // Footer con número de página
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setTextColor(...COLOR_GREY_400)
    doc.text(
      `Página ${i} de ${pageCount}  —  Ingresos: ${ingresos.length} / Deducciones: ${deducciones.length}`,
      14,
      doc.internal.pageSize.height - 8,
    )
  }

  doc.save(`tipos_ingresos_deducciones_${fechaGeneracion.replace(/\//g, '-')}.pdf`)
}

/**
 * Exporta la lista de Tipos de Ingresos y Deducciones a un archivo XLSX.
 * @param {Array} ingresos
 * @param {Array} deducciones
 * @param {{ nombreArchivo?: string }} opciones
 */
export function exportarTiposXLSX(ingresos, deducciones, { nombreArchivo = 'tipos_ingresos_deducciones' } = {}) {
  const fechaGeneracion = new Date().toLocaleDateString('es-DO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  // ── Hoja Ingresos ──
  const filasIngresos = ingresos.map((item) => ({
    'Nombre': item.nombre ?? '',
    'Tipo': item.dependeDeSalario ? 'Gravable' : 'No gravable',
    'Porcentaje (%)': item.porcentaje != null ? item.porcentaje : '',
    'Estado': item.estado ?? '',
  }))

  const wsIngresos = utils.json_to_sheet(filasIngresos)
  wsIngresos['!cols'] = [
    { wch: 35 }, // Nombre
    { wch: 15 }, // Tipo
    { wch: 15 }, // Porcentaje
    { wch: 12 }, // Estado
  ]

  // ── Hoja Deducciones ──
  const filasDeducciones = deducciones.map((item) => ({
    'Nombre': item.nombre ?? '',
    'Tipo': item.dependeDeSalario ? 'Gravable' : 'No gravable',
    'Porcentaje (%)': item.porcentaje != null ? item.porcentaje : '',
    'Estado': item.estado ?? '',
  }))

  const wsDeducciones = utils.json_to_sheet(filasDeducciones)
  wsDeducciones['!cols'] = [
    { wch: 35 }, // Nombre
    { wch: 15 }, // Tipo
    { wch: 15 }, // Porcentaje
    { wch: 12 }, // Estado
  ]

  const wb = utils.book_new()
  utils.book_append_sheet(wb, wsIngresos, 'Ingresos')
  utils.book_append_sheet(wb, wsDeducciones, 'Deducciones')

  writeFile(wb, `${nombreArchivo}_${fechaGeneracion.replace(/\//g, '-')}.xlsx`)
}
