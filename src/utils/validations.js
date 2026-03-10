// src/utils/validaciones.js

/**
    @param {string} cedula 
    @returns {boolean} 
 */
export function validarCedulaDominicana(cedula) {
  let cedulaLimpia = cedula.replace(/-/g, '').trim();

  if (!/^\d{11}$/.test(cedulaLimpia)) {
    return false;
  }

  const digitos = cedulaLimpia.substring(0, 10);
  const digitoVerificador = parseInt(cedulaLimpia.substring(10, 11));

  let suma = 0;
  const multiplicadores = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];

  for (let i = 0; i < 10; i++) {
    let multiplicacion = parseInt(digitos[i]) * multiplicadores[i];

    if (multiplicacion >= 10) {
      multiplicacion = Math.floor(multiplicacion / 10) + (multiplicacion % 10);
    }

    suma += multiplicacion;
  }

  let verificadorCalculado = (10 - (suma % 10)) % 10;

  return verificadorCalculado === digitoVerificador;
}