import React, { useState, useEffect, useCallback } from 'react';
import { X, Edit, Save } from 'lucide-react';
import { shipmentsService } from '../../services/shipmentsService';
import TabPanel from './TabPanel';
import TabNav from './TabNav';
import ShipmentHeader from './ShipmentHeader';
import DetailsTab from './tabs/DetailsTab';
import ItemsTab from './tabs/ItemsTab';
import DocumentsTab from './tabs/DocumentsTab';
import SimpleMapModal from '../SimpleMapModal';
import api from '../../services/api';

const ShipmentModal = ({
    shipment,
    onClose,
    userRole,
    userId,
    refreshShipments,
    transportistas,
    loadingTransportistas,
    setSuccessMessage
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const [showOriginMap, setShowOriginMap] = useState(false);
    const [showDestinationMap, setShowDestinationMap] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const [isLoading, setIsLoading] = useState(false);

    // Formatear URL del documento correctamente
    const formatDocumentUrl = useCallback((documentPath) => {
        if (!documentPath) return '#';

        // Si la ruta ya tiene http, es una URL completa
        if (documentPath.startsWith('http')) {
            return documentPath;
        }

        // Si la ruta comienza con / o no, asegurarse de que se forme bien la URL
        const baseUrl = import.meta.env.VITE_API_URL;
        const path = documentPath.startsWith('/') ? documentPath.substring(1) : documentPath;

        return `${baseUrl}/${path}`;
    }, []);

    // Cargar documentos actualizados
    const refreshDocumentsList = useCallback(async (shipmentId) => {
        try {
            setIsLoading(true);

            // Hacer una solicitud separada para obtener los documentos más recientes
            const response = await api.get(`/shipment/${shipmentId}/documents`);

            if (response && Array.isArray(response)) {
                // Formatear correctamente los documentos recibidos
                const formattedDocuments = response.map(doc => ({
                    ...doc,
                    file_content: doc.file_content || doc.path || doc.url || ''
                }));

                // Actualizar solo los documentos en el estado, manteniendo el resto de datos
                setEditData(prev => ({
                    ...prev,
                    documents: formattedDocuments
                }));

                return formattedDocuments;
            }

            return null;
        } catch (error) {
            console.error('Error al actualizar lista de documentos:', error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Recargar datos completos del envío
    const reloadShipmentData = useCallback(async (shipmentId) => {
        if (!shipmentId) return null;

        try {
            setIsLoading(true);
            const response = await api.get(`/shipment/${shipmentId}`);

            if (response && response.data) {
                // Preservar los ítems actuales para no perderlos si se están editando
                const currentItems = editData?.items || [];

                // Formatear las rutas de documentos si existen
                const formattedDocuments = Array.isArray(response.data.documents)
                    ? response.data.documents.map(doc => ({
                        ...doc,
                        file_content: doc.file_content || doc.path || doc.url
                    }))
                    : [];

                // Actualizar el estado con los datos frescos
                setEditData(prev => ({
                    ...response.data,
                    items: isEditing ? currentItems : (Array.isArray(response.data.items) ? response.data.items : []),
                    documents: formattedDocuments
                }));

                return response.data;
            }
        } catch (error) {
            console.error('Error al recargar datos del envío:', error);
        } finally {
            setIsLoading(false);
        }
        return null;
    }, [editData, isEditing]);

    // Inicializar datos cuando se abre el modal
    useEffect(() => {
        if (shipment && !editData) {
            setEditData({
                ...shipment,
                items: shipment.items && Array.isArray(shipment.items)
                    ? [...shipment.items]
                    : []
            });
        }
    }, [shipment, editData]);

    // Función auxiliar para verificar permisos de edición
    const canEdit = (shipment) => {
        if (!shipment) return false;
        if (userRole === 'admin') return true;
        return shipment.status !== 'entregado' && shipment.status !== 'cancelado';
    };

    const canTransportistaEdit = (shipment) => {
        if (userRole !== 'transportista') return canEdit(shipment);
        return canEdit(shipment);
    };

    // Manejadores de eventos
    const handleEditChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSelectOriginLocation = (location) => {
        setEditData(prev => ({
            ...prev,
            origin_address: location.address,
            origin_lat: location.lat,
            origin_lng: location.lng
        }));
        setShowOriginMap(false);
    };

    const handleSelectDestinationLocation = (location) => {
        setEditData(prev => ({
            ...prev,
            destination_address: location.address,
            destination_lat: location.lat,
            destination_lng: location.lng
        }));
        setShowDestinationMap(false);
    };

    const handleItemChange = (index, field, value) => {
        // Crear una copia profunda del array
        const updatedItems = JSON.parse(JSON.stringify(editData.items || []));

        // Asegurarse de que el elemento existe
        if (!updatedItems[index]) {
            updatedItems[index] = { description: '', quantity: 1, weight: 0, value: 0 };
        }

        // Actualizar el campo específico
        if (field === 'description') {
            updatedItems[index][field] = value;
        } else {
            // Para campos numéricos, asegurar que son números válidos
            updatedItems[index][field] = value === '' ? 0 : Number(value) || 0;
        }

        // Actualizar el estado con el nuevo array
        setEditData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    const handleAddItem = () => {
        const newItem = { description: '', quantity: 1, weight: 0, value: 0 };
        setEditData(prev => ({
            ...prev,
            items: [...(prev.items || []), newItem]
        }));
    };

    const handleRemoveItem = (index) => {
        const updatedItems = editData.items.filter((_, i) => i !== index);
        setEditData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    const handleFileUpload = async (e) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];

        if (file.type !== 'application/pdf') {
            setSuccessMessage('Solo se permiten archivos PDF');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setSuccessMessage('El archivo es demasiado grande. Máximo 5 MB.');
            return;
        }

        const formData = new FormData();
        formData.append('documents[]', file);

        try {
            setUploadingId(shipment.id);
            setSuccessMessage('Subiendo documento…');

            // Usar el servicio existente
            const response = await shipmentsService.uploadShipmentDocument(shipment.id, formData);

            if (response && response.ok) {
                setSuccessMessage('Documento subido correctamente');

                // Actualizar primero la lista global
                await refreshShipments();

                // Luego cargar nuevamente este envío específico para actualizar documentos
                const updatedShipment = await shipmentsService.getShipment(shipment.id);
                if (updatedShipment && updatedShipment.ok) {
                    // Actualizar solo los documentos
                    setEditData(prev => ({
                        ...prev,
                        documents: updatedShipment.data.documents || []
                    }));
                }
            } else {
                throw new Error('Error al subir documento');
            }
        } catch (err) {
            console.error('handleFileUpload:', err);
            setSuccessMessage(
                'Error al subir documento: ' + (err.message || 'Error desconocido')
            );
        } finally {
            setUploadingId(null);
            // Limpiar el input de archivo
            e.target.value = '';
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este documento?')) {
            try {
                setSuccessMessage('Eliminando documento...');

                const response = await shipmentsService.deleteDocument(documentId);

                if (response && response.ok) {
                    setSuccessMessage('Documento eliminado correctamente');

                    // Actualizar la lista global
                    await refreshShipments();

                    // Luego volver a cargar los datos de este envío
                    const updatedShipment = await shipmentsService.getShipment(shipment.id);
                    if (updatedShipment && updatedShipment.ok) {
                        // Actualizar solo los documentos
                        setEditData(prev => ({
                            ...prev,
                            documents: updatedShipment.data.documents || []
                        }));
                    } else {
                        // Fallback: Actualizar localmente eliminando el documento
                        setEditData(prev => ({
                            ...prev,
                            documents: (prev.documents || []).filter(doc => doc.id !== documentId)
                        }));
                    }
                } else {
                    throw new Error('Error al eliminar documento');
                }
            } catch (error) {
                console.error('Error al eliminar documento:', error);
                setSuccessMessage('Error al eliminar documento: ' + (error.message || 'Error desconocido'));
            }
        }
    };

    const handleSaveChanges = async () => {
        try {
            setIsLoading(true);

            if (!editData.origin_address || !editData.destination_address) {
                setSuccessMessage('Las direcciones de origen y destino son obligatorias');
                setIsLoading(false);
                return;
            }

            // Calcular total de los items
            const totalItemsValue = editData.items.reduce((total, item) => {
                return total + (Number(item.value) || 0) * (Number(item.quantity) || 1);
            }, 0);

            // Filtrar items vacíos
            const filteredItems = editData.items.filter(item =>
                item.description?.trim() !== '' ||
                Number(item.quantity) > 0 ||
                Number(item.weight) > 0 ||
                Number(item.value) > 0
            );

            const dataToSend = {
                ...editData,
                items: filteredItems,
                shipping_cost: totalItemsValue,
                origin_lat: String(editData.origin_lat || 0),
                origin_lng: String(editData.origin_lng || 0),
                destination_lat: String(editData.destination_lat || 0),
                destination_lng: String(editData.destination_lng || 0),
                admin_override: userRole === 'admin' ? true : undefined
            };

            setSuccessMessage('Guardando cambios...');

            const response = await api.put(`/shipment/${editData.id}`, dataToSend);

            if (response) {
                setSuccessMessage('Envío actualizado correctamente');
                await refreshShipments();
                await reloadShipmentData(shipment.id);
                setIsEditing(false);
            } else {
                throw new Error('Error al actualizar envío');
            }
        } catch (error) {
            console.error('Error al actualizar envío:', error);
            setSuccessMessage('Error al actualizar envío: ' + (error.message || 'Error desconocido'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!shipment) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <ShipmentHeader
                    shipment={shipment}
                    isEditing={isEditing}
                    userRole={userRole}
                    canTransportistaEdit={canTransportistaEdit}
                    handleSaveChanges={handleSaveChanges}
                    setIsEditing={setIsEditing}
                    onClose={() => {
                        setIsEditing(false);
                        onClose();
                        setEditData(null);
                    }}
                />

                {/* Tabs */}
                <TabNav
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    editData={editData}
                />

                {/* Loader overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/75 z-10 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <TabPanel activeTab={activeTab} tabId="details">
                        <DetailsTab
                            editData={editData}
                            shipment={shipment}
                            isEditing={isEditing}
                            userRole={userRole}
                            canEdit={canEdit}
                            transportistas={transportistas}
                            loadingTransportistas={loadingTransportistas}
                            handleEditChange={handleEditChange}
                            setShowOriginMap={setShowOriginMap}
                            setShowDestinationMap={setShowDestinationMap}
                        />
                    </TabPanel>

                    <TabPanel activeTab={activeTab} tabId="items">
                        <ItemsTab
                            editData={editData}
                            shipment={shipment}
                            isEditing={isEditing}
                            userRole={userRole}
                            canEdit={canEdit}
                            handleAddItem={handleAddItem}
                            handleItemChange={handleItemChange}
                            handleRemoveItem={handleRemoveItem}
                        />
                    </TabPanel>

                    <TabPanel activeTab={activeTab} tabId="documents">
                        <DocumentsTab
                            editData={editData}
                            shipment={shipment}
                            isEditing={isEditing}
                            userRole={userRole}
                            canEdit={canEdit}
                            canTransportistaEdit={canTransportistaEdit}
                            uploadingId={uploadingId}
                            handleFileUpload={handleFileUpload}
                            handleDeleteDocument={handleDeleteDocument}
                            formatDocumentUrl={formatDocumentUrl}
                        />
                    </TabPanel>
                </div>

                {/* Modales de Mapa */}
                {isEditing && (
                    <>
                        <SimpleMapModal
                            isOpen={showOriginMap}
                            onClose={() => setShowOriginMap(false)}
                            onSelectLocation={handleSelectOriginLocation}
                            initialAddress={{
                                address: editData.origin_address,
                                lat: editData.origin_lat || null,
                                lng: editData.origin_lng || null
                            }}
                        />

                        <SimpleMapModal
                            isOpen={showDestinationMap}
                            onClose={() => setShowDestinationMap(false)}
                            onSelectLocation={handleSelectDestinationLocation}
                            initialAddress={{
                                address: editData.destination_address,
                                lat: editData.destination_lat || null,
                                lng: editData.destination_lng || null
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ShipmentModal;