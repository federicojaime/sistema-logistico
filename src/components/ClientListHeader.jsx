// ClientListHeader.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const ClientListHeader = ({ onCreateClient }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Lista de Clientes</h1>

      <button
        onClick={onCreateClient}
        className="w-full sm:w-auto px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                 flex items-center justify-center gap-1.5 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Nuevo Cliente</span>
      </button>
    </div>
  );
};

export default ClientListHeader;