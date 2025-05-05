// ShipmentTable.jsx
import React from 'react';
import { Eye, FileText, Trash2, Upload, ArrowUpDown, Info } from 'lucide-react';

const ShipmentTable = ({
    shipments,
    sortField,
    sortDirection,
    toggleSort,
    onViewDetails,
    onShowInvoice,
    onUploadPOD,
    onDelete,
    uploadingId,
    statusColors,
    statusMap,
    userRole,
    handlePODUpload
}) => {
    // Función para formatear la dirección de destino
    const formatDestination = (address) => {
        if (!address) return '';
        
        // Buscar si la dirección contiene "Florida" o algún estado/código postal
        const floridaIndex = address.indexOf('Florida');
        if (floridaIndex >= 0) {
            // Obtener la parte desde "Florida" en adelante
            const shortAddress = address.substring(floridaIndex);
            return (
                <div className="relative inline-flex items-center group">
                    <span>{shortAddress}</span>
                    <Info className="h-4 w-4 ml-1 text-gray-400" />
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-black text-white p-3 rounded-lg text-sm  z-10 shadow-lg border border-gray-200">
                        {address}
                    </div>
                </div>
            );
        }
        
        // Si no encuentra "Florida", mostrar la versión truncada como antes
        return address.length > 30 ? `${address.substring(0, 30)}...` : address;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                                onClick={() => toggleSort('status')}
                            >
                                <div className="flex items-center gap-1">
                                    Estado
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Referencia
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                                onClick={() => toggleSort('customer')}
                            >
                                <div className="flex items-center gap-1">
                                    Cliente
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                                onClick={() => toggleSort('destination')}
                            >
                                <div className="flex items-center gap-1">
                                    Destino
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                                onClick={() => toggleSort('date')}
                            >
                                <div className="flex items-center gap-1">
                                    Fecha
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            {(userRole === 'admin' || userRole === 'cliente') && (
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                                    onClick={() => toggleSort('driver')}
                                >
                                    <div className="flex items-center gap-1">
                                        Transportista
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </th>
                            )}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {shipments.map((shipment) => (
                            <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[statusMap[shipment.status]]}`}>
                                        {statusMap[shipment.status]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {shipment.ref_code || `#${shipment.id.toString().padStart(6, '0')}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900">
                                        {shipment.customer}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDestination(shipment.destination_address)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(shipment.created_at).toLocaleDateString()}
                                </td>
                                {(userRole === 'admin' || userRole === 'cliente') && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {shipment.driver_name || 'No asignado'}
                                        </span>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center gap-2">
                                        <button
                                            onClick={() => onViewDetails(shipment)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                                            title="Ver detalles"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>

                                        {shipment.status === 'entregado' && userRole === 'admin' && (
                                            <button
                                                onClick={() => onShowInvoice(shipment)}
                                                className="text-gray-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-50"
                                                title="Factura"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </button>
                                        )}

                                        {userRole === 'transportista' && (
                                            <>
                                                <button
                                                    onClick={() => onUploadPOD(shipment.id)}
                                                    className="text-gray-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-50"
                                                    title="Subir POD"
                                                    disabled={uploadingId === shipment.id}
                                                >
                                                    {uploadingId === shipment.id ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />
                                                    ) : (
                                                        <Upload className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <input
                                                    id={`upload-pod-${shipment.id}`}
                                                    type="file"
                                                    accept=".pdf"
                                                    className="hidden"
                                                    onChange={(e) => handlePODUpload(e, shipment.id)}
                                                />
                                            </>
                                        )}

                                        {userRole === 'admin' && (
                                            <button
                                                onClick={() => onDelete(shipment.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShipmentTable;