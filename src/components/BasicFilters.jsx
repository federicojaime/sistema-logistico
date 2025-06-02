// BasicFilters.jsx
import React, { useState } from 'react';
import { Search, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

const BasicFilters = ({
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    showAdvanced,
    setShowAdvanced,
    statusMap
}) => {
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

    // Indicadores de color para los estados
    const statusIndicators = {
        'Pendiente': 'bg-yellow-500',
        'En tránsito': 'bg-blue-500',
        'Entregado': 'bg-green-500',
        'Cancelado': 'bg-red-500',
        'todos': 'bg-gray-400'
    };

    // Función para limpiar espacios del texto de búsqueda (solo múltiples espacios)
    const cleanSearchQuery = (value) => {
        return value
            .replace(/\s+/g, ' '); // Reemplaza múltiples espacios consecutivos por uno solo (pero permite espacios normales)
    };

    // Manejar cambios en el campo de búsqueda
    const handleSearchChange = (e) => {
        const rawValue = e.target.value;
        
        // Si el campo está completamente vacío, no aplicar limpieza
        if (rawValue === '') {
            setSearchQuery('');
            return;
        }
        
        // Solo limpiar múltiples espacios, pero permitir espacios normales
        const cleanedValue = cleanSearchQuery(rawValue);
        setSearchQuery(cleanedValue);
    };

    // Manejar el evento de pegado
    const handlePaste = (e) => {
        // Prevenir el comportamiento por defecto
        e.preventDefault();
        
        // Obtener el texto pegado
        const pastedText = e.clipboardData.getData('text');
        
        // Limpiar el texto pegado (aquí sí aplicamos trim completo)
        const cleanedText = pastedText.trim().replace(/\s+/g, ' ');
        
        // Establecer el valor limpio
        setSearchQuery(cleanedText);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            {/* Búsqueda por texto expandida */}
            <div className="relative col-span-1 md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar por cliente, subclient, comentario, ciudad o dirección..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onPaste={handlePaste}
                />
                {searchQuery && (
                    <button
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setSearchQuery('')}
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
                
                {/* Indicador de campos de búsqueda */}
                {searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-30">
                        <p className="text-xs text-gray-500 mb-2">Buscando en:</p>
                        <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                                Cliente
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-xs">
                                Subclient
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-800 text-xs">
                                Comentarios
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-100 text-orange-800 text-xs">
                                Direcciones
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs">
                                Ref. Code
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Estado + Botón de Filtros Avanzados */}
            <div className="flex gap-2">
                {/* Filtro por estado */}
                <div className="relative flex-1">
                    <div
                        className="flex items-center justify-between w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
                        onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    >
                        <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${statusIndicators[selectedStatus] || 'bg-gray-400'}`}></div>
                            <span className="text-gray-700 truncate">
                                {selectedStatus === 'todos' ? 'Todos los estados' : selectedStatus}
                            </span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${statusDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </div>

                    {statusDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)}></div>
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

                {/* Botón de filtros avanzados */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    title={showAdvanced ? "Ocultar filtros avanzados" : "Mostrar filtros avanzados"}
                >
                    <SlidersHorizontal className="w-5 h-5 text-gray-500" />
                    {showAdvanced ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default BasicFilters;