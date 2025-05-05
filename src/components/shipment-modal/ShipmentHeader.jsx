import React from 'react';
import { X, Edit, Save, Package } from 'lucide-react';

const ShipmentHeader = ({
    shipment,
    isEditing,
    userRole,
    canTransportistaEdit,
    handleSaveChanges,
    setIsEditing,
    onClose
}) => {
    return (
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-6 h-6 text-blue-600" />
                    <span>Envío {shipment.ref_code || `#${shipment.id.toString().padStart(6, '0')}`}</span>
                </h2>
                <p className="text-gray-500 mt-1">Cliente: {shipment.customer}</p>
            </div>
            <div className="flex gap-3">
                {((userRole === 'admin') ||
                    (userRole === 'transportista' && canTransportistaEdit(shipment))) && (
                        <button
                            onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
                            className={`px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm ${isEditing
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-md'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md'
                                }`}
                        >
                            {isEditing ? (
                                <>
                                    <Save className="w-5 h-5" />
                                    <span>Guardar</span>
                                </>
                            ) : (
                                <>
                                    <Edit className="w-5 h-5" />
                                    <span>Editar</span>
                                </>
                            )}
                        </button>
                    )}
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-300 shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ShipmentHeader;