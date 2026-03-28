import api from './api.js'

// Base: /v1/transaccion (singular)
const ENDPOINT = '/v1/registros-transaccion'

/**
 * Estructura real que devuelve el backend
 * @typedef {Object} TransaccionBackend
 * @property {number} id
 * @property {string} fecha
 * @property {string} fechaCreacion
 * @property {string} tipoTransaccion
 * @property {number} monto
 * @property {string} estado - "1" = INGRESO, "2" = DEDUCCIÓN
 * @property {Object} empleado
 * @property {number} empleado.id
 * @property {string} empleado.nombre
 * @property {string} empleado.cedula
 * @property {string} empleado.departamento
 * @property {Object} tipoDeIngreso
 * @property {Object} tipoDeDeduccion
 */

/**
 * @typedef {Object} Transaccion
 * @property {number} id
 * @property {string} fecha
 * @property {string} tipo
 * @property {string} nombreEmpleado
 * @property {string} cedulaEmpleado
 * @property {string} departamentoEmpleado
 * @property {number} monto
 * @property {boolean} dependeDeSalario
 * @property {string} estado - 'INGRESO' | 'DEDUCCIÓN'
 * @property {Object} tipoDeIngreso
 * @property {Object} tipoDeDeduccion
 */

/**
 * @typedef {Object} TransaccionPayload
 * @property {number} [id]
 * @property {number} empleadoId
 * @property {string} fecha
 * @property {number | null} monto - null cuando el tipo depende del salario
 * @property {number} [tipoDeIngresoId] - cuando es un ingreso
 * @property {number} [tipoDeDeduccionId] - cuando es una deducción
 */

export const transaccionesService = {
  /** @returns {Promise<Transaccion[]>} */
  getAll: () => api.get(ENDPOINT).then((r) => r.data),

  /** @param {number} id @returns {Promise<Transaccion>} */
  getById: (id) => api.get(`${ENDPOINT}/id/${id}`).then((r) => r.data),

  /** @param {TransaccionPayload} data @returns {Promise<Transaccion>} */
  create: (data) => api.post(ENDPOINT, data).then((r) => r.data),

  /** @param {TransaccionPayload & { id: number }} data @returns {Promise<Transaccion>} */
  update: (data) => api.put(`${ENDPOINT}/actualizar`, data).then((r) => r.data),

  /** @param {number} id @returns {Promise<string>} - mensaje de confirmación */
  delete: (id) => api.put(`${ENDPOINT}/eliminar/${id}`).then((r) => r.data),
}