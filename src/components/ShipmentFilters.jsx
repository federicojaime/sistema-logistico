import React, { useState } from 'react';
import { Search, Filter, Calendar, User, ChevronDown, X } from 'lucide-react';
import { statusMap } from '../utils/shipmentUtils';

const ShipmentFilters = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedDriver,
  setSelectedDriver,
  dateRange,
  setDateRange,
  transportistas,
  loadingTransportistas,
  userRole
}) => {
  // Estados para controlar los dropdowns
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [driverDropdownOpen, setDriverDropdownOpen] = useState(false);

  // Mapeo de colores para los estados
  const statusColors = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'En tránsito': 'bg-blue-100 text-blue-800',
    'Entregado': 'bg-green-100 text-green-800',
    'Cancelado': 'bg-red-100 text-red-800',
    'todos': 'bg-gray-100 text-gray-800'
  };

  // Indicadores de color para los estados
  const statusIndicators = {
    'Pendiente': 'bg-yellow-500',
    'En tránsito': 'bg-blue-500',
    'Entregado': 'bg-green-500',
    'Cancelado': 'bg-red-500',
    'todos': 'bg-gray-400'
  };

  // Cerrar los dropdowns cuando se hace clic fuera de ellos
  const handleClickOutside = () => {
    setStatusDropdownOpen(false);
    setDriverDropdownOpen(false);
  };

  return (
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Fila principal: Búsqueda y dropdown de estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Búsqueda por texto */}
        <div className="relative col-span-1 md:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cliente o lugar..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
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
        <div className="relative">
          <div
            className="flex items-center justify-between w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          >
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${statusIndicators[selectedStatus] || 'bg-gray-400'}`}></div>
              <span className="text-gray-700">
                {selectedStatus === 'todos' ? 'Todos los estados' : selectedStatus}
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${statusDropdownOpen ? 'transform rotate-180' : ''}`} />
          </div>
          
          {statusDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={handleClickOutside}></div>
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <ul className="py-1 max-h-60 overflow-y-auto">
                  <li
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${selectedStatus === 'todos' ? 'bg-blue-50 text-blue-600' : ''}`}
                    onClick={() => {
                      setSelectedStatus('todos');
                      setStatusDropdownOpen(false);
                    }}
                  >
                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                    <span>Todos los estados</span>
                  </li>
                  {Object.values(statusMap).map(status => (
                    <li
                      key={status}
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center ${selectedStatus === status ? 'bg-blue-50 text-blue-600' : ''}`}
                      onClick={() => {
                        setSelectedStatus(status);
                        setStatusDropdownOpen(false);
                      }}
                    >
                      <div className={`w-3 h-3 rounded-full mr-2 ${statusIndicators[status]}`}></div>
                      <span>{status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fila 2: Fechas y Transportista */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fecha desde */}
        <div className="relative">
          <div className="flex items-center absolute left-3 top-1/2 transform -translate-y-1/2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="ml-2 text-gray-600 whitespace-nowrap">Desde:</span>
          </div>
          <input
            type="date"
            className="w-full pl-24 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        
        {/* Fecha hasta */}
        <div className="relative">
          <div className="flex items-center absolute left-3 top-1/2 transform -translate-y-1/2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="ml-2 text-gray-600 whitespace-nowrap">Hasta:</span>
          </div>
          <input
            type="date"
            className="w-full pl-24 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>

        {/* Filtro por transportista (Solo para admin y cliente) */}
        {(userRole === 'admin' || userRole === 'cliente') && (
          <div className="relative">
            <div
              className="flex items-center justify-between w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
              onClick={() => setDriverDropdownOpen(!driverDropdownOpen)}
            >
              <div className="flex items-center truncate">
                <User className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-gray-700 truncate">
                  {selectedDriver === 'todos' 
                    ? 'Todos los transportistas' 
                    : selectedDriver === '99999' 
                      ? 'Sin Transportista' 
                      : transportistas.find(t => t.id === selectedDriver)?.displayName || 'Seleccionar transportista'}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${driverDropdownOpen ? 'transform rotate-180' : ''}`} />
            </div>
            
            {driverDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={handleClickOutside}></div>
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <ul className="py-1 max-h-60 overflow-y-auto">
                    <li
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${selectedDriver === 'todos' ? 'bg-blue-50 text-blue-600' : ''}`}
                      onClick={() => {
                        setSelectedDriver('todos');
                        setDriverDropdownOpen(false);
                      }}
                    >
                      Todos los transportistas
                    </li>
                    <li
                      className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${selectedDriver === '99999' ? 'bg-blue-50 text-blue-600' : ''}`}
                      onClick={() => {
                        setSelectedDriver('99999');
                        setDriverDropdownOpen(false);
                      }}
                    >
                      Sin transportista
                    </li>
                    {transportistas
                      .filter(t => t.id !== "99999")
                      .map(transportista => (
                        <li
                          key={transportista.id}
                          className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${selectedDriver === transportista.id ? 'bg-blue-50 text-blue-600' : ''}`}
                          onClick={() => {
                            setSelectedDriver(transportista.id);
                            setDriverDropdownOpen(false);
                          }}
                        >
                          {transportista.displayName}
                        </li>
                      ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentFilters;