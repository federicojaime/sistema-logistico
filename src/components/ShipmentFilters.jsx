import React from 'react';
import { Search, Filter, Calendar, User } from 'lucide-react';
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
  return (
    <div className="mb-6 space-y-4">
      {/* Fila 1: Búsqueda y Estados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Búsqueda por texto */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cliente o lugar..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5 flex-shrink-0" />
          <select
            className="w-full py-2 px-3 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            {Object.values(statusMap).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Fila 2: Fechas y Transportista */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fecha desde */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-gray-400 w-5 h-5" />
            <span className="text-sm text-gray-600">Desde:</span>
          </div>
          <input
            type="date"
            className="w-full py-2 px-3 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        
        {/* Fecha hasta */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-gray-400 w-5 h-5" />
            <span className="text-sm text-gray-600">Hasta:</span>
          </div>
          <input
            type="date"
            className="w-full py-2 px-3 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>

        {/* Filtro por transportista (Solo para admin y cliente) */}
        {(userRole === 'admin' || userRole === 'cliente') && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <User className="text-gray-400 w-5 h-5" />
              <span className="text-sm text-gray-600">Transportista:</span>
            </div>
            <select
              className="w-full py-2 px-3 rounded-lg border border-gray-300 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              disabled={loadingTransportistas}
            >
              <option value="todos">Todos los transportistas</option>
              <option value="99999">Sin transportista</option>
              {transportistas
                .filter(t => t.id !== "99999")
                .map(transportista => (
                  <option key={transportista.id} value={transportista.id}>
                    {transportista.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipmentFilters;