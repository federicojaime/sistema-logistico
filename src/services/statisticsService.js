// src/services/statisticsService.js
import api from './api';

export const statisticsService = {
    // Obtener estadísticas del dashboard con filtros opcionales
    getDashboardStatistics: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            return await api.get(`/statistics/dashboard?${params}`);
        } catch (error) {
            console.error('Error al obtener estadísticas del dashboard:', error);
            return {
                ok: false,
                msg: error.message || 'Error al obtener estadísticas',
                data: null
            };
        }
    },

    // Obtener estadísticas generales con filtros opcionales
    getGeneralStatistics: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            return await api.get(`/statistics/general?${params}`);
        } catch (error) {
            console.error('Error al obtener estadísticas generales:', error);
            return {
                ok: false,
                msg: error.message || 'Error al obtener estadísticas',
                data: null
            };
        }
    },

    // Obtener estadísticas de envíos con filtros opcionales
    getShipmentStatistics: async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            return await api.get(`/statistics/shipments?${params}`);
        } catch (error) {
            console.error('Error al obtener estadísticas de envíos:', error);
            return {
                ok: false,
                msg: error.message || 'Error al obtener estadísticas',
                data: null
            };
        }
    },

    // Obtener lista de clientes para filtros
    getClientsList: async () => {
        try {
            return await api.get('/clients');
        } catch (error) {
            console.error('Error al obtener lista de clientes:', error);
            return {
                ok: false,
                msg: error.message || 'Error al obtener clientes',
                data: []
            };
        }
    },

    // Obtener lista de conductores para filtros
    getDriversList: async () => {
        try {
            return await api.get('/users?role=transportista');
        } catch (error) {
            console.error('Error al obtener lista de conductores:', error);
            return {
                ok: false,
                msg: error.message || 'Error al obtener conductores',
                data: []
            };
        }
    },

    // Exportar estadísticas a CSV
    exportStatistics: async (type, filters = {}) => {
        try {
            const params = new URLSearchParams(filters);
            const token = localStorage.getItem('token');
            
            // Esta petición devuelve un blob (archivo CSV)
            const response = await fetch(`${api.defaults.baseURL}/statistics/export/${type}?${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error al exportar estadísticas: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Obtener nombre de archivo desde las cabeceras si existe
            const contentDisposition = response.headers.get('content-disposition');
            const filename = contentDisposition 
                ? contentDisposition.split('filename=')[1].replace(/"/g, '') 
                : `estadisticas_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return { ok: true, msg: 'Archivo exportado correctamente' };
        } catch (error) {
            console.error(`Error al exportar estadísticas de ${type}:`, error);
            throw error;
        }
    }
};

export default statisticsService;