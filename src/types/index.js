/**
 * Tipos de dominio del sistema de nóminas.
 * Basado en el esquema de base de datos (data.sql)
 */

/**
 * @typedef {'activo' | 'inactivo'} Estado
 */

// ─── Empleado ────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Empleado
 * @property {number} id
 * @property {string} cedula
 * @property {string} nombre
 * @property {string | null} departamento
 * @property {string | null} puesto
 * @property {number} salario_mensual
 * @property {number | null} id_nomina
 * @property {Estado} estado
 * @property {string} fecha_creacion
 */

/**
 * @typedef {Omit<Empleado, 'id' | 'fecha_creacion'>} EmpleadoPayload
 */

// ─── Tipo de Ingreso ──────────────────────────────────────────────────────────

/**
 * @typedef {Object} TipoIngreso
 * @property {number} id
 * @property {string} nombre
 * @property {boolean} depende_de_salario
 * @property {Estado} estado
 * @property {string} fecha_creacion
 */

/**
 * @typedef {Omit<TipoIngreso, 'id' | 'fecha_creacion'>} TipoIngresoPayload
 */

// ─── Tipo de Deducción ────────────────────────────────────────────────────────

/**
 * @typedef {Object} TipoDeduccion
 * @property {number} id
 * @property {string} nombre
 * @property {boolean} depende_de_salario
 * @property {Estado} estado
 * @property {string} fecha_creacion
 */

/**
 * @typedef {Omit<TipoDeduccion, 'id' | 'fecha_creacion'>} TipoDeduccionPayload
 */

export {}
