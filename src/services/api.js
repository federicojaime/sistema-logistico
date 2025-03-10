// src/services/api.js
import axios from 'axios';

// Crear la instancia de axios con la configuración base
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

// Request interceptor
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');

        // Log para debugging


        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        console.error('Error en la petición:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    response => {
        // Log para debugging


        return response.data;
    },
    error => {
        if (error.response) {
            // El servidor respondió con un código de error
            console.error('Error del servidor:', {
                url: error.config.url,
                status: error.response.status,
                data: error.response.data
            });

            if (error.response.status === 401) {
                if (!window.location.pathname.includes('/login')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    window.location.href = '/logistica/login';
                }
            }
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // La petición se hizo pero no se recibió respuesta
            console.error('Error de red - No se recibió respuesta');
            return Promise.reject({
                ok: false,
                msg: 'Error de conexión con el servidor',
                data: null
            });
        } else {
            // Error en la configuración de la petición
            console.error('Error de configuración:', error.message);
            return Promise.reject({
                ok: false,
                msg: error.message,
                data: null
            });
        }
    }
);

export default api;