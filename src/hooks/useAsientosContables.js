import { useState, useEffect, useCallback } from "react";
import { asientoContableService } from "../services/asientoContable.service.js";

function getCrearAsientoErrorMessage(err) {
  const status = err?.response?.status;
  const data = err?.response?.data;

  const backendMessage =
    (typeof data === "string" && data) ||
    data?.message ||
    data?.error ||
    err?.message ||
    "";

  const normalized = backendMessage.toLowerCase();
  const pareceSinTransacciones =
    normalized.includes("no hay trans") ||
    normalized.includes("no existen trans") ||
    normalized.includes("sin trans") ||
    normalized.includes("no transaction");

  if (pareceSinTransacciones) {
    return "No hay transacciones en el período seleccionado.";
  }

  // Fallback defensivo: el backend hoy devuelve 500 genérico en este caso.
  if (
    status === 500 &&
    (normalized.includes("request failed with status code 500") ||
      normalized.includes("internal server error"))
  ) {
    return "No hay transacciones en el período seleccionado.";
  }

  return "No se pudo generar el asiento. Verificá las fechas e intentá nuevamente.";
}

export function useAsientoContable() {
  const [asientos, setAsientos] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [resAsientos, resMonedas] = await Promise.all([
        asientoContableService.getAll(),
        asientoContableService.getMonedas(),
      ]);
      setAsientos(resAsientos);
      setMonedas(resMonedas);
    } catch (err) {
      setError("No se pudieron cargar los datos contables.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const crearAsiento = async (data) => {
    setSaving(true);
    try {
      await asientoContableService.create(data);
      await cargarDatos(); // Refrescar lista
    } catch (err) {
      console.error("Error al crear asiento:", err);
      throw new Error(getCrearAsientoErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const obtenerDetalle = async (id) => {
    try {
      return await asientoContableService.getById(id);
    } catch (err) {
      throw new Error("Error al obtener los detalles.");
    }
  };

  return {
    asientos,
    monedas,
    loading,
    saving,
    error,
    crearAsiento,
    obtenerDetalle,
  };
}