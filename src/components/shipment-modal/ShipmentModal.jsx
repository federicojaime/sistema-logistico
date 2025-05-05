import React, { useState, useEffect } from 'react';
import { X, Edit, Save } from 'lucide-react';
import { shipmentsService } from '../../services/shipmentsService';
import TabPanel from './TabPanel';
import TabNav from './TabNav';
import ShipmentHeader from './ShipmentHeader';
import DetailsTab from './tabs/DetailsTab';
import ItemsTab from './tabs/ItemsTab';
import DocumentsTab from './tabs/DocumentsTab';
import SimpleMapModal from '../SimpleMapModal';
import { formatDocumentUrl, reloadShipmentData, refreshDocumentsList } from './utils';

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

    // Inicializar datos cuando se abre el modal
    useEffect(() => {
        if (shipment && !editData) {
            setEditData({
                ...shipment,
                items: shipment.items ? [...shipment.items] : []
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
    };

    const handleSelectDestinationLocation = (location) => {
        setEditData(prev => ({
            ...prev,
            destination_address: location.address,
            destination_lat: location.lat,
            destination_lng: location.lng
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = editData.items.map((item, i) =>
            i === index ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
        );

        setEditData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    const handleAddItem = () => {
        const newItem = { description: '', quantity: 1, weight: 0, value: 0 };
        setEditData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
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

            const response = await shipmentsService.uploadShipmentDocument(
                shipment.id,
                formData
            );

            if (!response || !response.ok) throw new Error('Error al subir documento');

            // Cachear los ítems actuales para no perderlos
            const cachedItems = editData.items;

            // Actualizar la lista global de envíos
            await refreshShipments();

            // Actualizar específicamente los documentos de este envío
            await refreshDocumentsList(shipment.id, setEditData);

            setSuccessMessage('Documento subido correctamente');
        } catch (err) {
            console.error('handleFileUpload:', err);
            setSuccessMessage(
                'Error al subir documento: ' + (err.message || 'Error desconocido')
            );
        } finally {
            setUploadingId(null);
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este documento?')) {
            try {
                setSuccessMessage('Eliminando documento...');

                const response = await shipmentsService.deleteDocument(documentId);

                if (response && response.ok) {
                    setSuccessMessage('Documento eliminado correctamente');

                    // Actualizar los datos en el estado global
                    await refreshShipments();

                    // Actualizar específicamente la lista de documentos
                    await refreshDocumentsList(shipment.id, setEditData);

                    // Si no se actualizó correctamente, usar el fallback
                    if (!editData.documents) {
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
            if (!editData.origin_address || !editData.destination_address) {
                setSuccessMessage('Las direcciones de origen y destino son obligatorias');
                return;
            }

            // Calcular total de los items
            const totalItemsValue = editData.items.reduce((total, item) => {
                return total + (item.value || 0) * (item.quantity || 1);
            }, 0);

            // Filtrar items vacíos
            const filteredItems = editData.items.filter(item =>
                item.description?.trim() !== '' ||
                item.quantity > 0 ||
                item.weight > 0 ||
                item.value > 0
            );

            const dataToSend = {
                ...editData,
                items: filteredItems,
                shipping_cost: totalItemsValue,
                origin_lat: String(editData.origin_lat),
                origin_lng: String(editData.origin_lng),
                destination_lat: String(editData.destination_lat),
                destination_lng: String(editData.destination_lng),
                admin_override: userRole === 'admin' ? true : undefined
            };

            setSuccessMessage('Guardando cambios...');

            const response = await shipmentsService.updateShipment(editData.id, dataToSend);

            if (response && (response.ok || response.status === 200)) {
                setSuccessMessage('Envío actualizado correctamente');
                await refreshShipments();
                await reloadShipmentData(shipment.id, setEditData, shipmentsService);
                setIsEditing(false);
            } else {
                throw new Error('Error al actualizar envío');
            }
        } catch (error) {
            console.error('Error al actualizar envío:', error);
            setSuccessMessage('Error al actualizar envío: ' + (error.message || 'Error desconocido'));
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