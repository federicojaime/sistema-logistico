// src/components/shipment-creation/components/AddressStep.jsx
import React, { useState } from 'react';
import { MapPin, Map } from 'lucide-react';
import SimpleMapModal from '../../SimpleMapModal';

const AddressStep = ({ shipment, handleChange, errors }) => {
    const [showOriginMap, setShowOriginMap] = useState(false);
    const [showDestinationMap, setShowDestinationMap] = useState(false);

    // Manejar la selección de ubicación de origen
    const handleSelectOriginLocation = (location) => {
        handleChange('direccionOrigen', location.address);
        handleChange('latitudOrigen', String(location.lat));
        handleChange('longitudOrigen', String(location.lng));
        setShowOriginMap(false);
    };

    // Manejar la selección de ubicación de destino
    const handleSelectDestinationLocation = (location) => {
        handleChange('direccionDestino', location.address);
        handleChange('latitudDestino', String(location.lat));
        handleChange('longitudDestino', String(location.lng));
        setShowDestinationMap(false);
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Direcciones</h2>
                <p className="text-sm text-gray-600">Selecciona la dirección de origen y destino del envío.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dirección Origen */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center mb-3">
                        <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="font-medium text-gray-800">Origen</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Origen *</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={shipment.direccionOrigen}
                                    className={`flex-1 px-4 py-3 rounded-xl border ${errors.direccionOrigen ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        } focus:outline-none focus:ring-2 transition-colors text-gray-900 bg-gray-50`}
                                    placeholder="Selecciona en el mapa"
                                    readOnly
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOriginMap(true)}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    <Map className="w-5 h-5" />
                                </button>
                            </div>
                            {errors.direccionOrigen && (
                                <p className="mt-1 text-sm text-red-500">{errors.direccionOrigen}</p>
                            )}
                        </div>

                        {/* Mostrar coordenadas si existen */}
                        {shipment.latitudOrigen && shipment.longitudOrigen && (
                            <div className="px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                                <p>Latitud: {parseFloat(shipment.latitudOrigen).toFixed(6)}</p>
                                <p>Longitud: {parseFloat(shipment.longitudOrigen).toFixed(6)}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dirección Destino */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center mb-3">
                        <MapPin className="w-5 h-5 text-red-600 mr-2" />
                        <h3 className="font-medium text-gray-800">Destino</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Destino *</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={shipment.direccionDestino}
                                    className={`flex-1 px-4 py-3 rounded-xl border ${errors.direccionDestino ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        } focus:outline-none focus:ring-2 transition-colors text-gray-900 bg-gray-50`}
                                    placeholder="Selecciona en el mapa"
                                    readOnly
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowDestinationMap(true)}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    <Map className="w-5 h-5" />
                                </button>
                            </div>
                            {errors.direccionDestino && (
                                <p className="mt-1 text-sm text-red-500">{errors.direccionDestino}</p>
                            )}
                        </div>

                        {/* Mostrar coordenadas si existen */}
                        {shipment.latitudDestino && shipment.longitudDestino && (
                            <div className="px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                                <p>Latitud: {parseFloat(shipment.latitudDestino).toFixed(6)}</p>
                                <p>Longitud: {parseFloat(shipment.longitudDestino).toFixed(6)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modales de Mapa */}
            <SimpleMapModal
                isOpen={showOriginMap}
                onClose={() => setShowOriginMap(false)}
                onSelectLocation={handleSelectOriginLocation}
                initialAddress={{
                    address: shipment.direccionOrigen,
                    lat: shipment.latitudOrigen ? parseFloat(shipment.latitudOrigen) : null,
                    lng: shipment.longitudOrigen ? parseFloat(shipment.longitudOrigen) : null
                }}
            />

            <SimpleMapModal
                isOpen={showDestinationMap}
                onClose={() => setShowDestinationMap(false)}
                onSelectLocation={handleSelectDestinationLocation}
                initialAddress={{
                    address: shipment.direccionDestino,
                    lat: shipment.latitudDestino ? parseFloat(shipment.latitudDestino) : null,
                    lng: shipment.longitudDestino ? parseFloat(shipment.longitudDestino) : null
                }}
            />
        </div>
    );
};

export default AddressStep;