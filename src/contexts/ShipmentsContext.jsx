import React, { createContext, useContext, useState } from 'react';

const ShipmentsContext = createContext();

export function ShipmentsProvider({ children }) {
  const [shipments, setShipments] = useState([
    {
      id: 1,
      cliente: 'Cliente Ejemplo',
      direccionOrigen: 'Origen 1',
      direccionDestino: 'Destino 1',
      lugar: 'Depósito Central',
      peso: 120,
      cantidadPiezas: 10,
      liftgate: true,
      estado: 'Pendiente',
    },
  ]);

  const addShipment = (newShipment) => {
    setShipments((prevShipments) => [...prevShipments, newShipment]);
  };

  return (
    <ShipmentsContext.Provider value={{ shipments, addShipment }}>
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
