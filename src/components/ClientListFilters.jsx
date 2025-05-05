// ClientListFilters.jsx
import React, { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

const ClientListFilters = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
}) => {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Status options
  const statusOptions = [
    { id: 'todos', name: 'Todos los estados' },
    { id: 'active', name: 'Activos' },
    { id: 'inactive', name: 'Inactivos' }
  ];

  // Indicadores de color para los estados
  const statusIndicators = {
    'todos': 'bg-gray-400',
    'active': 'bg-green-500',
    'inactive': 'bg-red-500'
  };

  return (
    <div className="space-y-3">
      {/* Búsqueda por texto - Adaptado para móvil */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nombre o CUIT..."
          className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtro por estado - Adaptado para móvil */}
      <div className="relative w-full">
        <div
          className="flex items-center justify-between w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
        >
          <div className="flex items-center">
            <Filter className="text-gray-400 w-4 h-4 mr-2" />
            <div className={`w-2.5 h-2.5 rounded-full mr-2 ${statusIndicators[selectedStatus] || 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-700">
              {statusOptions.find(s => s.id === selectedStatus)?.name || 'Todos los estados'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${statusDropdownOpen ? 'transform rotate-180' : ''}`} />
        </div>
        
        {statusDropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)}></div>
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <ul className="py-1 max-h-48 overflow-y-auto">
                {statusOptions.map(status => (
                  <li
                    key={status.id}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${selectedStatus === status.id ? 'bg-blue-50 text-blue-600' : ''}`}
                    onClick={() => {
                      setSelectedStatus(status.id);
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mr-2 ${statusIndicators[status.id]}`}></div>
                    <span className="text-sm">{status.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientListFilters;