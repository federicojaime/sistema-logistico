// src/services/authService.js
import api from './api';

export const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });

            // Verificar la estructura de la respuesta
            if (!response || !response.data || !response.data.token) {
                console.error('Estructura de respuesta inválida:', response);
                return { ok: false, error: 'No token received' };
            }

            // Extraer el token eliminando el prefijo "Bearer " si existe
            const token = response.data.token.replace('Bearer ', '');

            const userData = {
                id: response.data.id,
                email: response.data.email,
                name: `${response.data.firstname} ${response.data.lastname}`,
                role: response.data.role
            };

            // Guardar en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(userData));

            return { ok: true, data: userData };
        } catch (error) {
            console.error('Login error:', error);
            return { ok: false, error: 'Credenciales inválidas' };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/logistica/login';
    },

    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('currentUser');
            const token = localStorage.getItem('token');

            if (!userStr || !token) {
                return null;
            }

            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },
    
    getUsers: async () => {
        try {
            return await api.get('/users');
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error;
        }
    },

    createUser: async (userData) => {
        try {
            return await api.post('/user', userData);
        } catch (error) {
            console.error('Error al crear usuario:', error);
            throw error;
        }
    },

    updateUser: async (id, userData) => {
        try {
            return await api.patch(`/user/${id}`, userData);
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            return await api.delete(`/user/${id}`);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error;
        }
    }
};