// src/services/shipmentsService.js
import api from './api';

export const shipmentsService = {
    getShipments: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters || {}).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    params.append(key, value);
                }
            });

            const queryString = params.toString();
            const url = `/shipments${queryString ? `?${queryString}` : ''}`;

            const response = await api.get(url);

            if (response.ok && Array.isArray(response.data)) {
                const formattedData = response.data.map(shipment => ({
                    ...shipment,
                    driver_name:
                        shipment.driver_firstname && shipment.driver_lastname
                            ? `${shipment.driver_firstname} ${shipment.driver_lastname}`
                            : 'No asignado',
                    items: Array.isArray(shipment.items) ? shipment.items : [],
                    documents: Array.isArray(shipment.documents) ? shipment.documents : [],
                }));

                return {
                    ok: true,
                    data: formattedData,
                    msg: '',
                };
            }

            return {
                ok: false,
                data: [],
                msg: 'Formato de respuesta inválido',
            };
        } catch (error) {
            console.error('Error en getShipments:', error);
            return {
                ok: false,
                data: [],
                msg: error.message || 'Error al obtener los envíos',
            };
        }
    },

    getShipment: async (id) => {
        try {
            const response = await api.get(`/shipment/${id}`);
            return {
                ok: true,
                data: response.data,
                msg: '',
            };
        } catch (error) {
            return {
                ok: false,
                data: null,
                msg: error.message || 'Error al obtener el envío',
            };
        }
    },

    createShipment: async (formData) => {
        try {
            const response = await api.post('/shipment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                ok: true,
                data: response.data,
                msg: 'Envío creado correctamente',
            };
        } catch (error) {
            return {
                ok: false,
                data: null,
                msg: error.response?.data?.msg || error.message || 'Error al crear el envío',
            };
        }
    },

    updateShipment: async (id, data) => {
        try {
            // Si hay archivos, usar FormData
            if (data.documents && data.documents.some(doc => doc instanceof File)) {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (key === 'documents') {
                        data.documents.forEach((doc, index) => {
                            if (doc instanceof File) {
                                formData.append(`documents[]`, doc);
                            }
                        });
                    } else if (key === 'items') {
                        formData.append('items', JSON.stringify(value));
                    } else {
                        formData.append(key, value);
                    }
                });

                const response = await api.put(`/shipment/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                return {
                    ok: true,
                    data: response.data,
                    msg: 'Envío actualizado correctamente',
                };
            }

            // Si no hay archivos, enviar JSON normal
            const response = await api.put(`/shipment/${id}`, data);
            return {
                ok: true,
                data: response.data,
                msg: 'Envío actualizado correctamente',
            };
        } catch (error) {
            return {
                ok: false,
                data: null,
                msg: error.response?.data?.msg || error.message || 'Error al actualizar el envío',
            };
        }
    },

    updateShipmentStatus: async (id, status) => {
        try {
            const response = await api.patch(`/shipment/${id}/status`, {
                status: status,
            });

            return {
                ok: true,
                data: response.data,
                msg: 'Estado actualizado correctamente',
            };
        } catch (error) {
            return {
                ok: false,
                data: null,
                msg: error.message || 'Error al actualizar el estado',
            };
        }
    },

    deleteShipment: async (id) => {
        try {
            const response = await api.delete(`/shipment/${id}`);
            return {
                ok: true,
                data: response.data,
                msg: 'Envío eliminado correctamente',
            };
        } catch (error) {
            return {
                ok: false,
                data: null,
                msg: error.message || 'Error al eliminar el envío',
            };
        }
    },

    // Métodos para manejo de documentos
    uploadShipmentDocument: async (shipmentId, formData) => {
        try {
            const response = await api.post(`/shipment/${shipmentId}/document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                ok: true,
                data: response.data,
                msg: 'Documento subido correctamente',
            };
        } catch (error) {
            return {
                ok: false,
                data: null,
                msg: error.message || 'Error al subir el documento',
            };
        }
    },

    deleteDocument: async (documentId) => {
        try {
            const response = await api.delete(`/shipment/document/${documentId}`);
            return {
                ok: true,
                data: response.data,
                msg: 'Documento eliminado correctamente',
            };
        } catch (error) {
            return {
                ok: false,
                data: null,
                msg: error.message || 'Error al eliminar el documento',
            };
        }
    },

    uploadPOD: async (id, file) => {
        try {
            const formData = new FormData();
            formData.append('pod', file);

            const response = await api.post(`/shipment/${id}/pod`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return {
                ok: true,
                data: response.data,
                msg: 'POD subido correctamente',
            };
        } catch (error) {
            return {
                ok: false,
                data: null,
                msg: error.message || 'Error al subir el POD',
            };
        }
    },

    // Método para descargar documentos
    downloadDocument: async (documentId) => {
        try {
            const response = await api.get(`/shipment/document/${documentId}`, {
                responseType: 'blob'
            });

            return {
                ok: true,
                data: response.data,
                msg: '',
            };
        } catch (error) {
            return {
                ok: false,
                data: null,
                msg: error.message || 'Error al descargar el documento',
            };
        }
    },

    // Método para obtener documentos de un envío específico
    getShipmentDocuments: async (shipmentId) => {
        try {
            const response = await api.get(`/shipment/${shipmentId}/documents`);
            return {
                ok: true,
                data: response.data,
                msg: '',
            };
        } catch (error) {
            return {
                ok: false,
                data: null,
                msg: error.message || 'Error al obtener los documentos del envío',
            };
        }
    }
};

export default shipmentsService;