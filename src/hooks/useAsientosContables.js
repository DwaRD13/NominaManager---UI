import { useState, useEffect, useCallback } from "react";
import { asientoContableService } from "../services/asientoContable.service.js";

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
      throw err;
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
