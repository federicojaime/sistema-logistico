// src/components/SimpleMapModal.jsx
import React from 'react';
import { X } from 'lucide-react';
import SimpleMapComponent from './SimpleMapComponent';

const SimpleMapModal = ({ isOpen, onClose, onSelectLocation, initialAddress = null }) => {
  if (!isOpen) return null;

  // Preparar los datos iniciales del mapa
  let initialLocation = null;
  
  // Si hay una dirección inicial, usarla para la ubicación inicial
  if (initialAddress) {
    // Puede ser un objeto completo o solo una cadena
    if (typeof initialAddress === 'string' && initialAddress.trim() !== "") {
      initialLocation = {
        address: initialAddress
      };
    } else if (typeof initialAddress === 'object') {
      // Si es un objeto, pasarlo directamente
      initialLocation = {
        ...initialAddress,
        lat: initialAddress.lat || null,
        lng: initialAddress.lng || null
      };
    }
  }

  // Función que maneja la selección y cierra el modal
  const handleLocationSelect = (location) => {
    onSelectLocation(location);
    onClose(); // Cerrar el modal después de seleccionar la ubicación
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Seleccionar ubicación</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <SimpleMapComponent 
            initialLocation={initialLocation}
            onSelectLocation={handleLocationSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default SimpleMapModal;