const BASE_URL = import.meta.env.VITE_API_URL;

export const clientsService = {
     async getClients(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${BASE_URL}/clients?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    },

    async getClient(id) {
        const response = await fetch(`${BASE_URL}/client/${id}`);
        return await response.json();
    },

    async createClient(data) {
        const response = await fetch(`${BASE_URL}/client`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async updateClient(id, data) {
        const response = await fetch(`${BASE_URL}/client/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    async deleteClient(id) {
        const response = await fetch(`${BASE_URL}/client/${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    },
    async getSubClients(clientId) {
        try {
            const response = await fetch(`${BASE_URL}/clients/${clientId}/subclients`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error getting subclients:', error);
            return {
                ok: false,
                data: [],
                msg: 'Error al obtener los subclientes'
            };
        }
    }
};
