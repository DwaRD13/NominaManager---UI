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
 * Respuesta del backend — campos reales de TiposIngresos.java
 * El backend NO tiene fechaCreacion en esta entidad.
 * @typedef {Object} TipoIngreso
 * @property {number} id
 * @property {string} nombre
 * @property {boolean} dependeDeSalario
 * @property {string} estado   — valor libre, ej: "Activo" / "Inactivo"
 */

/**
 * Payload para crear un tipo de ingreso (sin id)
 * @typedef {Object} TipoIngresoPayload
 * @property {string} nombre
 * @property {boolean} dependeDeSalario
 * @property {string} estado
 */

/**
 * Payload para actualizar (requiere id para el backend)
 * @typedef {TipoIngresoPayload & { id: number }} TipoIngresoUpdatePayload
 */

// ─── Tipo de Deducción ────────────────────────────────────────────────────────
// El backend aún NO tiene implementado el módulo de deducciones.
// Estos tipos se definen para uso futuro.

/**
 * @typedef {Object} TipoDeduccion
 * @property {number} id
 * @property {string} nombre
 * @property {boolean} dependeDeSalario
 * @property {string} estado
 */

/**
 * @typedef {Omit<TipoDeduccion, 'id'>} TipoDeduccionPayload
 */

export {}
