/**
 * Tipos de dominio del sistema de nóminas.
 * Basado en la entidad Empleado.java y EmpleadoDTO.java del backend.
 */

/**
 * @typedef {'ACTIVO' | 'INACTIVO'} EstadoEmpleado
 */

// ─── Empleado ────────────────────────────────────────────────────────────────

/**
 * Respuesta que devuelve el backend — campos en camelCase (Jackson serialization)
 * @typedef {Object} Empleado
 * @property {number} id
 * @property {string} nombre
 * @property {string} cedula
 * @property {string | null} departamento
 * @property {string | null} puesto
 * @property {number} salarioMensual
 * @property {number | null} idNomina
 * @property {EstadoEmpleado} estado
 * @property {string} fechaCreacion  — ISO datetime string
 */

/**
 * Payload para crear un empleado (sin id ni fechaCreacion)
 * @typedef {Object} EmpleadoPayload
 * @property {string} nombre
 * @property {string} cedula
 * @property {string | null} departamento
 * @property {string | null} puesto
 * @property {number} salarioMensual
 * @property {number | null} idNomina
 * @property {EstadoEmpleado} estado
 */

/**
 * Payload para actualizar un empleado (requiere id para el backend)
 * @typedef {EmpleadoPayload & { id: number }} EmpleadoUpdatePayload
 */

// ─── Tipo de Ingreso ──────────────────────────────────────────────────────────

/**
 * @typedef {Object} TipoIngreso
 * @property {number} id
 * @property {string} nombre
 * @property {boolean} dependeDeSalario
 * @property {string} estado
 * @property {string} fechaCreacion
 */

/**
 * @typedef {Omit<TipoIngreso, 'id' | 'fechaCreacion'>} TipoIngresoPayload
 */

// ─── Tipo de Deducción ────────────────────────────────────────────────────────

/**
 * @typedef {Object} TipoDeduccion
 * @property {number} id
 * @property {string} nombre
 * @property {boolean} dependeDeSalario
 * @property {string} estado
 * @property {string} fechaCreacion
 */

/**
 * @typedef {Omit<TipoDeduccion, 'id' | 'fechaCreacion'>} TipoDeduccionPayload
 */

export {}
