import api from "./api.js";

const ENDPOINT = "/v1/asiento_contable";

export const asientoContableService = {

  /** * @returns {Promise<import('../types').Moneda[]>} 
   */
  getMonedas: () => api.get(`${ENDPOINT}/monedas`).then((r) => r.data),
  
  /** * @returns {Promise<import('../types').AsientoContable[]>} 
   */
  getAll: () => api.get(ENDPOINT).then((r) => r.data),

  /**
   * Obtiene el detalle completo (DTO) incluyendo transacciones vinculadas
   * @param {number | string} id
   * @returns {Promise<import('../types').AsientoContableDTO>}
   */
  getById: (id) => api.get(`${ENDPOINT}/${id}`).then((r) => r.data),

  /**
   * Crea un asiento contable. 
   * Envía la moneda en el Body y los parámetros de filtro en el Query String.
   * * @param {Object} params
   * @param {import('../types').Moneda} params.moneda - Se envía como @RequestBody
   * @param {string} params.fechaInicio - Se envía como @RequestParam
   * @param {string} params.fechaFin - Se envía como @RequestParam
   * @param {string} params.descripcion - Se envía como @RequestParam
   * @returns {Promise<import('../types').AsientoContable>}
   */
  create: ({ moneda, fechaInicio, fechaFin, descripcion }) => 
    api.post(ENDPOINT, moneda, {
      params: {
        fechaInicio,
        fechaFin,
        descripcion
      }
    }).then((r) => r.data),
};