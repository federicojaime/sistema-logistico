// src/services/emailService.js
import api from './api';

export const emailService = {
    getClientEmail: async (clientId) => {
        try {
            const response = await api.get(`/client/${clientId}`);
            return {
                ok: true,
                email: response.data?.email || '',
                data: response.data
            };
        } catch (error) {
            console.error('Error obteniendo email del cliente:', error);
            return {
                ok: false,
                email: '',
                data: null
            };
        }
    }
};