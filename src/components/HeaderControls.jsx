// HeaderControls.jsx
import React from 'react';
import { RefreshCw, Plus } from 'lucide-react';

const HeaderControls = ({ resetAllFilters, userRole, onCreateShipment }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-3">
            <h1 className="text-2xl font-bold text-gray-800">Lista de Envíos</h1>

            <div className="flex gap-2">
                <button
                    onClick={resetAllFilters}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg 
                 flex items-center gap-2 transition-colors"
                    title="Restablecer todos los filtros"
                >
                    <RefreshCw className="w-5 h-5" />
                    <span className="hidden sm:inline">Limpiar Filtros</span>
                </button>

                {userRole === 'admin' && (
                    <button
                        onClick={onCreateShipment}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                     flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Crear Envío</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default HeaderControls;