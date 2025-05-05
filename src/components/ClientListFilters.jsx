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
    <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Búsqueda por texto */}
      <div className="relative col-span-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre o CUIT..."
          className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filtro por estado */}
      <div className="relative col-span-1">
        <div
          className="flex items-center justify-between w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
        >
          <div className="flex items-center">
            <Filter className="text-gray-400 w-5 h-5 mr-2" />
            <div className={`w-3 h-3 rounded-full mr-2 ${statusIndicators[selectedStatus] || 'bg-gray-400'}`}></div>
            <span className="text-gray-700">
              {statusOptions.find(s => s.id === selectedStatus)?.name || 'Todos los estados'}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${statusDropdownOpen ? 'transform rotate-180' : ''}`} />
        </div>
        
        {statusDropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)}></div>
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              <ul className="py-1 max-h-60 overflow-y-auto">
                {statusOptions.map(status => (
                  <li
                    key={status.id}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${selectedStatus === status.id ? 'bg-blue-50 text-blue-600' : ''}`}
                    onClick={() => {
                      setSelectedStatus(status.id);
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <div className={`w-3 h-3 rounded-full mr-2 ${statusIndicators[status.id]}`}></div>
                    <span>{status.name}</span>
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