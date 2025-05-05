import React, { useState } from 'react';
import { Eye, FileText, Trash2, Upload } from 'lucide-react';
import { useShipments } from '../contexts/ShipmentsContext';
import { reverseStatusMap } from '../utils/shipmentUtils';

const ShipmentListItem = ({
    shipment,
    userRole,
    userId,
    onViewDetails,
    onShowInvoice,
    onUploadPOD,
    onHandlePODUpload,
    onDelete,
    uploadingId,
    statusColors,
    statusMap
}) => {
    const { updateShipment } = useShipments();
    const [editingStatus, setEditingStatus] = useState(null);

    // Función común para verificar si un envío puede ser editado
    const canEdit = (shipment) => {
        if (!shipment) return false;
        // Permitir a los administradores editar cualquier envío, independientemente del estado
        if (userRole === 'admin') return true;
        // Para otros roles, mantener la restricción
        return shipment.status !== 'entregado' && shipment.status !== 'cancelado';
    };

    // Verificar si el transportista puede editar este envío
    const canTransportistaEdit = (shipment) => {
        if (userRole !== 'transportista') return canEdit(shipment);
        return canEdit(shipment);
    };

    // Verificar si se puede mostrar la factura
    const canShowInvoice = (shipment) => {
        return userRole === 'admin' && shipment.status === 'entregado';
    };

    // Cambiar estado del envío
    const handleStatusChange = async (newStatus) => {
        // Verificar si el transportista puede cambiar el estado
        if (userRole === 'transportista' &&
            (shipment.status === 'entregado' || shipment.status === 'cancelado')) {
            alert('No se puede modificar un envío entregado o cancelado');
            setEditingStatus(null);
            return;
        }

        try {
            const updatedShipment = {
                ...shipment,
                status: reverseStatusMap[newStatus]
            };

            await updateShipment(updatedShipment);
            setEditingStatus(null);
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            alert('Error al actualizar estado: ' + (error.message || 'Error desconocido'));
        }
    };

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                {editingStatus === shipment.id && canTransportistaEdit(shipment) ? (
                    <select
                        className="rounded-lg border border-gray-300 text-sm p-1"
                        value={statusMap[shipment.status]}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        onBlur={() => setEditingStatus(null)}
                    >
                        {Object.values(statusMap).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${statusColors[statusMap[shipment.status]]}`}
                        onClick={() => userRole === 'transportista' && canTransportistaEdit(shipment) && setEditingStatus(shipment.id)}
                        style={{ cursor: (userRole === 'transportista' && canTransportistaEdit(shipment)) ? 'pointer' : 'default' }}
                    >
                        {statusMap[shipment.status]}
                    </span>
                )}
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
                {shipment.destination_address && shipment.destination_address.length > 30
                    ? `${shipment.destination_address.substring(0, 30)}...`
                    : shipment.destination_address}
            </td>

            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(shipment.created_at)}
            </td>

            {(userRole === 'admin' || userRole === 'cliente') && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                bg-blue-100 text-blue-800`}>
                        {shipment.driver_name || 'No asignado'}
                    </span>
                </td>
            )}

            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end items-center gap-2">
                    <button
                        onClick={onViewDetails}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalles"
                    >
                        <Eye className="w-5 h-5" />
                    </button>

                    {/* Mostrar factura solo si es admin y el envío está entregado */}
                    {canShowInvoice(shipment) && (
                        <button
                            onClick={onShowInvoice}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Factura"
                        >
                            <FileText className="w-5 h-5" />
                        </button>
                    )}

                    {userRole === 'transportista' && canTransportistaEdit(shipment) && (
                        <>
                            <button
                                onClick={() => onUploadPOD(shipment.id)}
                                className="text-gray-400 hover:text-green-600 transition-colors"
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
                                onChange={(e) => onHandlePODUpload(e, shipment.id)}
                            />
                        </>
                    )}

                    {userRole === 'admin' && (
                        <button
                            onClick={() => onDelete(shipment.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default ShipmentListItem;