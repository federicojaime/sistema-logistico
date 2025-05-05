// ClientEmptyState.jsx
import React from 'react';
import { Building2 } from 'lucide-react';

const ClientEmptyState = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <div className="mb-4">
        <Building2 className="h-16 w-16 mx-auto text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No hay clientes para mostrar
      </h3>
      <p className="text-gray-500">
        No se encontraron clientes con los filtros seleccionados.
      </p>
    </div>
  );
};

export default ClientEmptyState;