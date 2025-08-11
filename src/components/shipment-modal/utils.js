// src/components/shipment-modal/utils.js

// Función para formatear correctamente la URL del documento
export const formatDocumentUrl = (documentPath) => {
    if (!documentPath) return '#';

    // Si la ruta ya tiene http, es una URL completa
    if (documentPath.startsWith('http')) {
        return documentPath;
    }

    // Si la ruta comienza con / o no, asegurarse de que se forme bien la URL
    const baseUrl = import.meta.env.VITE_API_URL;
    const path = documentPath.startsWith('/') ? documentPath.substring(1) : documentPath;

    return `${baseUrl}/${path}`;
};

// Función para obtener o actualizar datos específicos del envío
export const reloadShipmentData = async (shipmentId, setEditData, shipmentsService) => {
    if (shipmentId) {
        try {
            const response = await shipmentsService.getShipment(shipmentId);
            if (response && response.ok && response.data) {
                // Formatear las rutas de documentos si existen
                const formattedDocuments = Array.isArray(response.data.documents)
                    ? response.data.documents.map(doc => ({
                        ...doc,
                        // Asegurar que la ruta del documento esté bien formada
                        file_content: doc.file_content || doc.path || doc.url
                    }))
                    : [];

                setEditData(prev => ({
                    ...prev,
                    ...response.data,
                    items: Array.isArray(response.data.items) && response.data.items.length > 0
                        ? [...response.data.items]
                        : (prev?.items || []),
                    documents: formattedDocuments
                }));

                return response.data;
            }
        } catch (error) {
            console.error('Error al recargar datos del envío:', error);
        }
    }
    return null;
};

// Función específica para actualizar lista de documentos
export const refreshDocumentsList = async (shipmentId, setEditData, shipmentsService) => {
    try {
        // Obtener específicamente los documentos más recientes
        const documentsResponse = await shipmentsService.getShipmentDocuments(shipmentId);

        if (documentsResponse && documentsResponse.ok && Array.isArray(documentsResponse.data)) {
            // Formatear correctamente los documentos recibidos
            const formattedDocuments = documentsResponse.data.map(doc => ({
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
    }
};

// Función para calcular el total actual de items
export const getCurrentTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;

    return items.reduce((total, item) => {
        const value = parseFloat(item.value) || 0;
        const quantity = parseFloat(item.quantity) || 1;
        return total + (value);
    }, 0);
};

// Función para formatear el costo del envío
export const formatShippingCost = (cost) => {
    const numericCost = typeof cost === 'string' ? parseFloat(cost) : (typeof cost === 'number' ? cost : 0);
    return isNaN(numericCost) ? '0.00' : numericCost.toFixed(2);
};