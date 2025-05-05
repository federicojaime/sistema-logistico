// ClientListHeader.jsx
import React from 'react';
import { Plus } from 'lucide-react';

const ClientListHeader = ({ onCreateClient }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-3">
      <h1 className="text-2xl font-bold text-gray-800">Lista de Clientes</h1>

      <div className="flex gap-2">
        <button
          onClick={onCreateClient}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                   flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Nuevo Cliente</span>
        </button>
      </div>
    </div>
  );
};

export default ClientListHeader;