// src/contexts/ShipmentsContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { shipmentsService } from '../services/shipmentsService';

const ShipmentsContext = createContext();

export function ShipmentsProvider({ children }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadShipments = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await shipmentsService.getShipments(filters);

      if (response.ok && Array.isArray(response.data)) {
        setShipments(response.data);
        setError(null);
      } else {
        setShipments([]);
        setError(response.msg || 'Error al obtener los envíos');
        console.error('Error al cargar envíos:', response.msg);
      }
    } catch (err) {
      setShipments([]);
      const errorMessage = 'Error al cargar los envíos';
      setError(errorMessage);
      console.error(errorMessage, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  const addShipment = async (shipmentData) => {
    try {
      setLoading(true);
      const response = await shipmentsService.createShipment(shipmentData);

      if (response.ok) {
        await loadShipments();
        return true;
      } else {
        setError(response.msg);
        return false;
      }
    } catch (err) {
      setError('Error al crear el envío');
      console.error('Error en addShipment:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateShipment = async (updatedShipment) => {
    try {
      setLoading(true);
      // Asegúrate de que estás pasando el status correcto
      const response = await shipmentsService.updateShipmentStatus(
        updatedShipment.id,
        updatedShipment.status // Cambiado de 'estado' a 'status'
      );

      if (response.ok) {
        await loadShipments();
        return true;
      } else {
        setError(response.msg);
        return false;
      }
    } catch (err) {
      setError('Error al actualizar el envío');
      console.error('Error en updateShipment:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    shipments,
    loading,
    error,
    addShipment,
    updateShipment,
    deleteShipment: async (id) => {
      try {
        const response = await shipmentsService.deleteShipment(id);
        if (response.ok) {
          await loadShipments();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error al eliminar el envío:', err);
        return false;
      }
    },
    refreshShipments: loadShipments
  };

  return (
    <ShipmentsContext.Provider value={value}>
      {children}
    </ShipmentsContext.Provider>
  );
}

export function useShipments() {
  const context = useContext(ShipmentsContext);
  if (!context) {
    throw new Error('useShipments debe usarse dentro de ShipmentsProvider');
  }
  return context;
}