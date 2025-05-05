import React, { useState, useEffect } from 'react';
import { X, Edit, Save, MapPin, Upload, Eye, Download, Trash2, Plus, DollarSign, Package, MapIcon, FileText, Clipboard, AlertCircle } from 'lucide-react';
import { shipmentsService } from '../services/shipmentsService';
import SimpleMapModal from './SimpleMapModal';
import { statusMap, statusColors } from '../utils/shipmentUtils';

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

    // Calcular el total de los ítems
    const calculateItemsTotal = (items) => {
        if (!items || !items.length) return 0;

        return items.reduce((total, item) => {
            const value = parseFloat(item.value) || 0;
            const quantity = parseFloat(item.quantity) || 0;
            return total + (value * quantity);
        }, 0);
    };

    // Inicializar datos de edición cuando se abre el modal
    useEffect(() => {
        const loadShipmentData = async () => {
            // Si ya tenemos datos, no hacer nada
            if (editData) return;

            if (shipment) {
                try {
                    // Intentar cargar datos frescos del servidor
                    const freshData = await shipmentsService.getShipment(shipment.id);

                    if (freshData && freshData.ok && freshData.data) {
                        // Usar datos frescos
                        setEditData({
                            ...freshData.data,
                            items: Array.isArray(freshData.data.items) ?
                                [...freshData.data.items] : [],
                            documents: Array.isArray(freshData.data.documents) ?
                                [...freshData.data.documents] : []
                        });
                    } else {
                        // Usar datos del props como fallback
                        setEditData({
                            ...shipment,
                            items: shipment.items && Array.isArray(shipment.items)
                                ? [...shipment.items]
                                : [],
                            documents: shipment.documents && Array.isArray(shipment.documents)
                                ? [...shipment.documents]
                                : []
                        });
                    }
                } catch (error) {
                    console.error('Error cargando datos del envío:', error);
                    // Usar datos del props como fallback
                    setEditData({
                        ...shipment,
                        items: shipment.items && Array.isArray(shipment.items)
                            ? [...shipment.items]
                            : [],
                        documents: shipment.documents && Array.isArray(shipment.documents)
                            ? [...shipment.documents]
                            : []
                    });
                }
            }
        };

        loadShipmentData();
    }, [shipment, editData, shipmentsService]);

    // Función para obtener los datos actualizados del servidor
    const reloadShipmentData = async () => {
        if (shipment && shipment.id) {
            try {
                const response = await shipmentsService.getShipment(shipment.id);
                if (response && response.ok && response.data) {
                    await refreshShipments();

                    setEditData(prev => {
                        // Si el backend trae items válidos, los uso; si no, mantengo los locales
                        const items = Array.isArray(response.data.items) && response.data.items.length > 0
                            ? [...response.data.items]
                            : (prev.items || []);
                        // Si el backend trae documentos válidos, los uso; si no, mantengo los locales
                        const documents = Array.isArray(response.data.documents) && response.data.documents.length > 0
                            ? [...response.data.documents]
                            : (prev.documents || []);
                        return {
                            ...prev,
                            ...response.data,
                            items,
                            documents
                        };
                    });

                    return response.data;
                }
            } catch (error) {
                console.error('Error al recargar datos del envío:', error);
            }
        }
        return null;
    };

    // Manejar cambios en campos de envío
    const handleEditChange = (field, value) => {
        setEditData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Manejar la selección de ubicación de origen
    const handleSelectOriginLocation = (location) => {
        setEditData(prev => ({
            ...prev,
            origin_address: location.address,
            origin_lat: location.lat,
            origin_lng: location.lng
        }));
    };

    // Manejar la selección de ubicación de destino
    const handleSelectDestinationLocation = (location) => {
        setEditData(prev => ({
            ...prev,
            destination_address: location.address,
            destination_lat: location.lat,
            destination_lng: location.lng
        }));
    };

    // Manejar cambios en items
    const handleItemChange = (index, field, value) => {
        const updatedItems = editData.items.map((item, i) =>
            i === index ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
        );

        setEditData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    // Agregar nuevo item
    const handleAddItem = () => {
        const newItem = { description: '', quantity: 1, weight: 0, value: 0 };

        setEditData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
    };

    // Eliminar item
    const handleRemoveItem = (index) => {
        const updatedItems = editData.items.filter((_, i) => i !== index);

        setEditData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    // Guardar cambios con manejo de actualización mejorado
    const handleSaveChanges = async () => {
        try {
            // Asegúrate de que todos los campos necesarios estén presentes
            if (!editData.origin_address || !editData.destination_address) {
                setSuccessMessage('Las direcciones de origen y destino son obligatorias');
                return;
            }

            // Asegurarse que el shipping_cost coincida con el total de los items
            const totalItemsValue = calculateItemsTotal(editData.items);

            // Eliminar los items vacíos antes de enviar
            const filteredItems = editData.items.filter(item =>
                item.description?.trim() !== '' ||
                item.quantity > 0 ||
                item.weight > 0 ||
                item.value > 0
            );

            const dataToSend = {
                ...editData,
                // Usar los items filtrados sin vacíos
                items: filteredItems,
                // Establecer shipping_cost igual al total de los items
                shipping_cost: totalItemsValue,
                // Convertir explícitamente a strings
                origin_lat: String(editData.origin_lat),
                origin_lng: String(editData.origin_lng),
                destination_lat: String(editData.destination_lat),
                destination_lng: String(editData.destination_lng)
            };

            // Incluye una flag para indicar que es un admin quien hace el cambio
            if (userRole === 'admin') {
                dataToSend.admin_override = true;
            }

            // Mostrar mensaje de procesamiento
            setSuccessMessage('Guardando cambios...');

            // Llamar a la API para actualizar el envío
            const response = await shipmentsService.updateShipment(editData.id, dataToSend);

            if (response && (response.ok || response.status === 200)) {
                // Guardar una copia de los items actuales en caso de problemas
                const currentItems = [...dataToSend.items];

                // Mostrar mensaje de éxito
                setSuccessMessage('Envío actualizado correctamente');

                // Actualizar los datos en el estado global
                await refreshShipments();

                // Actualizar el estado local inmediatamente con los datos enviados
                setEditData(prev => ({
                    ...prev,
                    items: currentItems,
                    documents: prev.documents
                }));

                // Recargar los datos específicos del envío en segundo plano
                reloadShipmentData().then(updatedShipment => {
                    if (updatedShipment) {
                        // Verificar si los items se cargaron correctamente
                        if (!updatedShipment.items || updatedShipment.items.length !== currentItems.length) {
                            // Si hay discrepancia, usar los items que enviamos originalmente
                            updatedShipment.items = currentItems;
                            console.log('Restaurando los items originales debido a discrepancia con el servidor');
                        }

                        // Actualizar el estado local con los datos actualizados
                        setEditData(prev => ({
                            ...prev,
                            ...updatedShipment,
                            items: Array.isArray(updatedShipment.items) && updatedShipment.items.length > 0 ? updatedShipment.items : prev.items,
                            documents: Array.isArray(updatedShipment.documents) && updatedShipment.documents.length > 0 ? updatedShipment.documents : prev.documents
                        }));
                    }
                });

                // Salir del modo de edición
                setIsEditing(false);
            } else {
                throw new Error('Error al actualizar envío');
            }
        } catch (error) {
            console.error('Error al actualizar envío:', error);
            setSuccessMessage('Error al actualizar envío: ' + (error.message || 'Error desconocido'));
        }
    };

    // Subir archivo con manejo mejorado
    // ShipmentModal.jsx
    const handleFileUpload = async (e) => {
        /* ───────────────── 0. archivo seleccionado ───────────────── */
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];

        /* ───────────────── 1. validaciones rápidas ───────────────── */
        if (file.type !== 'application/pdf') {
            setSuccessMessage('Solo se permiten archivos PDF');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5 MB
            setSuccessMessage('El archivo es demasiado grande. Máximo 5 MB.');
            return;
        }

        /* ───────────────── 2. envío al backend ───────────────── */
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

            /* ───────────────── 3. armo el objeto documento ───────────────── */
            const resData = response.data || {};          // payload backend
            const newDoc = {
                id: resData.id ?? Date.now(),               // fallback temporal
                name:
                    resData.name ??
                    resData.original_name ??
                    resData.filename ??
                    file.name,                                // siempre algo visible
                file_content:
                    resData.file_content ??
                    resData.path ??
                    resData.url ??
                    // fallback: asumimos que el backend guarda el PDF con su nombre
                    `storage/shipments/${shipment.id}/${file.name}`
            };

            /* ───────────────── 4. cacheo los ítems actuales ───────────────── */
            const cachedItems = editData.items;

            /* ───────────────── 5. refresco la lista global ───────────────── */
            await refreshShipments();                     // ya no borra items

            /* ───────────────── 6. actualizo el modal ───────────────── */
            setEditData((prev) => ({
                ...prev,
                items: cachedItems,                         // reinstala los ítems
                documents: [...(prev.documents || []), newDoc]
            }));

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


    // Eliminar documento con manejo mejorado
    const handleDeleteDocument = async (documentId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este documento?')) {
            try {
                setSuccessMessage('Eliminando documento...');

                const response = await shipmentsService.deleteDocument(documentId);

                if (response && response.ok) {
                    setSuccessMessage('Documento eliminado correctamente');

                    // Actualizar los datos en el estado global
                    await refreshShipments();

                    // Actualizar el estado local de documentos inmediatamente
                    setEditData(prev => ({
                        ...prev,
                        items: prev.items,
                        documents: (prev.documents || []).filter(doc => doc.id !== documentId)
                    }));

                    // Recargar los datos específicos del envío
                    const updatedShipment = await reloadShipmentData();
                    if (updatedShipment) {
                        setEditData(prev => {
                            const items = Array.isArray(updatedShipment.items) && updatedShipment.items.length > 0 ? updatedShipment.items : prev.items;
                            const documents = Array.isArray(updatedShipment.documents) && updatedShipment.documents.length > 0 ? updatedShipment.documents : prev.documents;
                            return {
                                ...prev,
                                ...updatedShipment,
                                items,
                                documents
                            };
                        });
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

    // Función para formatear el costo de envío correctamente
    const formatShippingCost = (cost) => {
        // Asegurarse que el costo sea un número
        const numericCost = typeof cost === 'string' ? parseFloat(cost) : (typeof cost === 'number' ? cost : 0);
        return isNaN(numericCost) ? '0.00' : numericCost.toFixed(2);
    };

    // Calcular el total actual de items
    const getCurrentTotal = () => {
        if (isEditing && editData?.items) {
            return calculateItemsTotal(editData.items);
        } else if (shipment?.items) {
            return calculateItemsTotal(shipment.items);
        }
        return 0;
    };

    if (!shipment) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Encabezado con animación suave */}
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
                            onClick={() => {
                                setIsEditing(false);
                                onClose();
                                setEditData(null);
                            }}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-300 shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Pestañas / Navegación */}
                <div className="flex items-center px-6 pt-4 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex items-center gap-2 px-5 py-3 font-medium transition-all ${activeTab === 'details'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <Clipboard className="w-5 h-5" />
                        <span>Detalles</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`flex items-center gap-2 px-5 py-3 font-medium transition-all ${activeTab === 'items'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <Package className="w-5 h-5" />
                        <span>Items</span>
                        {editData?.items?.length > 0 && (
                            <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full px-2 py-0.5">
                                {editData.items.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`flex items-center gap-2 px-5 py-3 font-medium transition-all ${activeTab === 'documents'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <FileText className="w-5 h-5" />
                        <span>Documentos</span>
                        {editData?.documents && editData.documents.length > 0 && (
                            <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full px-2 py-0.5">
                                {editData.documents.length}
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* Pestaña de Detalles */}
                    {activeTab === 'details' && (
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
                                                    value={editData.customer}
                                                    onChange={(e) => handleEditChange('customer', e.target.value)}
                                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-800 font-medium">{shipment.customer}</p>
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
                                                        {transportistas.filter(t => t.id !== "99999").map((transportista) => (
                                                            <option key={transportista.id} value={transportista.id}>
                                                                {transportista.displayName}
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
                                                    {formatShippingCost(getCurrentTotal())}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
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
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.origin_address}
                                                onChange={(e) => handleEditChange('origin_address', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                                readOnly
                                            />
                                        ) : (
                                            <p className="text-gray-700">{shipment.origin_address}</p>
                                        )}
                                        {editData?.origin_lat && (
                                            <p className="mt-2 text-xs text-gray-500">
                                                Coordenadas: {Number(editData.origin_lat).toFixed(6)}, {Number(editData.origin_lng).toFixed(6)}
                                            </p>
                                        )}
                                    </div>

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
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.destination_address}
                                                onChange={(e) => handleEditChange('destination_address', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                                readOnly
                                            />
                                        ) : (
                                            <p className="text-gray-700">{shipment.destination_address}</p>
                                        )}
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
                    )}

                    {/* Pestaña de Items */}
                    {activeTab === 'items' && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-medium flex items-center gap-2 text-gray-800">
                                    <Package className="w-5 h-5 text-blue-600" />
                                    <span>Items del Envío</span>
                                </h3>
                                {isEditing && userRole === 'admin' && canEdit(shipment) && (
                                    <button
                                        onClick={handleAddItem}
                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Agregar Item
                                    </button>
                                )}
                            </div>

                            {editData?.items?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Peso</th>
                                                {userRole === 'admin' && (
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                                )}
                                                {isEditing && userRole === 'admin' && canEdit(shipment) && (
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {(editData?.items && editData.items.length > 0 ? editData.items : shipment.items || []).map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        {isEditing && userRole === 'admin' && canEdit(shipment) ? (
                                                            <input
                                                                type="text"
                                                                value={item.description}
                                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-700">{item.description}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                                        {isEditing && userRole === 'admin' && canEdit(shipment) ? (
                                                            <input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                min="1"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-700">{item.quantity}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                                        {isEditing && userRole === 'admin' && canEdit(shipment) ? (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <input
                                                                    type="number"
                                                                    value={item.weight}
                                                                    onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                    min="0"
                                                                    step="0.1"
                                                                />
                                                                <span className="text-gray-500">lb</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-700">{item.weight} lb</span>
                                                        )}
                                                    </td>
                                                    {userRole === 'admin' && (
                                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                                            {isEditing && canEdit(shipment) ? (
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <span className="text-gray-500">$</span>
                                                                    <input
                                                                        type="number"
                                                                        value={item.value}
                                                                        onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                                                                        className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                        min="0"
                                                                        step="0.01"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-700">${item.value}</span>
                                                            )}
                                                        </td>
                                                    )}
                                                    {isEditing && userRole === 'admin' && canEdit(shipment) && (
                                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleRemoveItem(index)}
                                                                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {/* Fila de Total con efectos visuales mejorados */}
                                            <tr className="font-semibold bg-blue-50/50 border-t-2 border-blue-100">
                                                <td colSpan="2" className="px-4 py-3 text-right">Peso Total:</td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <span className="font-medium">
                                                        {(editData?.items && editData.items.length > 0 ? editData.items : shipment.items || []).reduce((total, item) => {
                                                            const weight = parseFloat(item.weight) || 0;
                                                            const quantity = parseFloat(item.quantity) || 0;
                                                            return total + (weight * quantity);
                                                        }, 0).toFixed(2)} lb
                                                    </span>
                                                </td>
                                                {userRole === 'admin' && (
                                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                                        <span className="font-medium text-green-600">
                                                            {getCurrentTotal().toFixed(2)}
                                                        </span>
                                                    </td>
                                                )}
                                                {isEditing && userRole === 'admin' && canEdit(shipment) && <td></td>}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No hay items en este envío.</p>
                                    {isEditing && userRole === 'admin' && canEdit(shipment) && (
                                        <button
                                            onClick={handleAddItem}
                                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Agregar Primer Item
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pestaña de Documentos */}
                    {activeTab === 'documents' && (
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-medium flex items-center gap-2 text-gray-800">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <span>Documentos</span>
                                </h3>
                                {((userRole === 'admin' && canEdit(shipment)) ||
                                    (userRole === 'transportista' && canTransportistaEdit(shipment))) && (
                                        <button
                                            onClick={() => document.getElementById('uploadPdf').click()}
                                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 
                                            transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Subir PDF
                                        </button>
                                    )}
                                <input
                                    id="uploadPdf"
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>

                            {uploadingId === shipment.id && (
                                <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
                                    <p className="text-blue-700">Subiendo documento...</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                {editData?.documents && editData.documents.length > 0 ? (
                                    editData.documents.map((doc, index) => (
                                        <div key={index}
                                            className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-blue-50/30 transition-colors border border-gray-100">
                                            <span className="text-sm flex-1 font-medium truncate">{doc.name}</span>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}/${doc.file_content}`, '_blank')}
                                                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-sm hidden sm:inline">Ver</span>
                                                </button>

                                                <a
                                                    href={`${import.meta.env.VITE_API_URL}/${doc.file_content}`}
                                                    download
                                                    className="text-green-600 hover:text-green-800 flex items-center gap-1"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span className="text-sm hidden sm:inline">Descargar</span>
                                                </a>

                                                {((userRole === 'admin' && canEdit(shipment)) ||
                                                    (userRole === 'transportista' && canTransportistaEdit(shipment))) && (
                                                        <button
                                                            onClick={() => handleDeleteDocument(doc.id)}
                                                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span className="text-sm hidden sm:inline">Eliminar</span>
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No hay documentos adjuntos a este envío.</p>
                                        {((userRole === 'admin' && canEdit(shipment)) ||
                                            (userRole === 'transportista' && canTransportistaEdit(shipment))) && (
                                                <button
                                                    onClick={() => document.getElementById('uploadPdf').click()}
                                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Subir Documento
                                                </button>
                                            )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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