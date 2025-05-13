import React from 'react';
import { MapPin, DollarSign, MapIcon, AlertCircle, Users } from 'lucide-react';
import { statusMap, statusColors } from '../../../utils/shipmentUtils';
import { formatShippingCost, getCurrentTotal } from '../utils';

const DetailsTab = ({
    editData,
    shipment,
    isEditing,
    userRole,
    canEdit,
    transportistas,
    loadingTransportistas,
    handleEditChange,
    setShowOriginMap,
    setShowDestinationMap
}) => {
    return (
        <div className="space-y-8">
            {/* Panel de información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[statusMap[shipment.status]]}`}>
                            {statusMap[shipment.status]}
                        </span>
                        {isEditing && (
                            <select
                                value={editData.status}
                                onChange={(e) => handleEditChange('status', e.target.value)}
                                className="ml-auto px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                {Object.entries(statusMap).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.customer || ''}
                                    onChange={(e) => handleEditChange('customer', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            ) : (
                                <p className="text-gray-800 font-medium">{shipment.customer}</p>
                            )}
                        </div>

                        {/* Subcliente - Nuevo campo añadido */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 flex items-center">
                                <Users className="w-4 h-4 mr-1 text-blue-500" />
                                Sub Cliente
                            </h3>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.subclient || ''}
                                    onChange={(e) => handleEditChange('subclient', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Opcional"
                                />
                            ) : (
                                <p className="text-gray-800">
                                    {shipment.subclient ? (
                                        shipment.subclient
                                    ) : (
                                        <span className="text-gray-400 italic text-sm">No especificado</span>
                                    )}
                                </p>
                            )}
                        </div>

                        {userRole === 'admin' && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Transportista Asignado</h3>
                                {isEditing && canEdit(shipment) ? (
                                    <select
                                        value={editData.driver_id || '99999'}
                                        onChange={(e) => handleEditChange('driver_id', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loadingTransportistas}
                                    >
                                        <option value="99999">
                                            {loadingTransportistas
                                                ? 'Cargando transportistas...'
                                                : 'Seleccionar transportista'}
                                        </option>
                                        {transportistas && transportistas.filter && transportistas.filter(t => t.id !== "99999").map((transportista) => (
                                            <option key={transportista.id} value={transportista.id}>
                                                {transportista.displayName || transportista.name || `Transportista ${transportista.id}`}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-gray-800 font-medium">{shipment.driver_name || 'No asignado'}</p>
                                )}
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Total</h3>
                            <div className="flex items-center gap-1 mt-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <p className="text-lg font-semibold text-green-600">
                                    {formatShippingCost(getCurrentTotal(editData?.items))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Dirección Origen */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <h3 className="font-medium flex items-center gap-2 text-gray-800">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <span>Dirección Origen</span>
                            </h3>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setShowOriginMap(true)}
                                    className="ml-auto px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-1"
                                >
                                    <MapIcon className="w-4 h-4" />
                                    <span>Seleccionar</span>
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.origin_address || ''}
                                    onChange={(e) => handleEditChange('origin_address', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    readOnly
                                    placeholder="Selecciona en el mapa..."
                                />
                            ) : (
                                <p className="text-gray-700">{shipment.origin_address || 'No especificada'}</p>
                            )}
                        </div>
                        {editData?.origin_lat && (
                            <p className="mt-2 text-xs text-gray-500">
                                Coordenadas: {Number(editData.origin_lat).toFixed(6)}, {Number(editData.origin_lng).toFixed(6)}
                            </p>
                        )}
                    </div>

                    {/* Dirección Destino */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-4">
                            <h3 className="font-medium flex items-center gap-2 text-gray-800">
                                <MapPin className="w-5 h-5 text-red-600" />
                                <span>Dirección Destino</span>
                            </h3>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setShowDestinationMap(true)}
                                    className="ml-auto px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-1"
                                >
                                    <MapIcon className="w-4 h-4" />
                                    <span>Seleccionar</span>
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editData.destination_address || ''}
                                    onChange={(e) => handleEditChange('destination_address', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                    readOnly
                                    placeholder="Selecciona en el mapa..."
                                />
                            ) : (
                                <p className="text-gray-700">{shipment.destination_address || 'No especificada'}</p>
                            )}
                        </div>
                        {editData?.destination_lat && (
                            <p className="mt-2 text-xs text-gray-500">
                                Coordenadas: {parseFloat(editData.destination_lat).toFixed(6)}, {parseFloat(editData.destination_lng).toFixed(6)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Comentarios */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="font-medium flex items-center gap-2 text-gray-800 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span>Comentarios / Instrucciones</span>
                </h3>
                {isEditing ? (
                    <textarea
                        value={editData.comments || ''}
                        onChange={(e) => handleEditChange('comments', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Ejemplo: Llamar 1 hr antes de entrega TEL # 555-123-4567 JUAN"
                    />
                ) : (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        {shipment.comments ? (
                            <p className="text-gray-700 whitespace-pre-line">{shipment.comments}</p>
                        ) : (
                            <p className="text-gray-500 italic">No hay comentarios o instrucciones</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsTab;