// AdvancedFilters.jsx
import React, { useState } from 'react';
import { Calendar, User, ChevronDown } from 'lucide-react';

const AdvancedFilters = ({
    dateRange,
    setDateRange,
    selectedDriver,
    setSelectedDriver,
    transportistas,
    userRole
}) => {
    const [driverDropdownOpen, setDriverDropdownOpen] = useState(false);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-fadeIn">
            {/* Fecha desde */}
            <div className="relative">
                <div className="flex items-center absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="ml-2 text-gray-600 whitespace-nowrap">Desde:</span>
                </div>
                <input
                    type="date"
                    className="w-full pl-24 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full pl-24 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
            </div>

            {/* Filtro por transportista (Solo para admin y cliente) */}
            {(userRole === 'admin' || userRole === 'cliente') && (
                <div className="relative">
                    <div
                        className="flex items-center justify-between w-full px-3 py-3 bg-white border border-gray-200 rounded-lg cursor-pointer"
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
                            <div className="fixed inset-0 z-10" onClick={() => setDriverDropdownOpen(false)}></div>
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
    );
};

export default AdvancedFilters;