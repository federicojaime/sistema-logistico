// EmptyState.jsx
import React from 'react';
import { Package } from 'lucide-react';

const EmptyState = ({ userRole }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="mb-4">
                <Package className="h-16 w-16 mx-auto text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay envíos para mostrar
            </h3>
            <p className="text-gray-500">
                {userRole === 'transportista'
                    ? 'Actualmente no tienes envíos asignados.'
                    : 'No se encontraron envíos con los filtros seleccionados.'}
            </p>
        </div>
    );
};

export default EmptyState;