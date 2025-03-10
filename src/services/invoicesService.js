// src/services/invoicesService.js
import api from './api';

export const invoicesService = {
    getInvoices: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        return await api.get(`/invoices?${params}`);
    },

    getInvoice: async (id) => {
        return await api.get(`/invoice/${id}`);
    },

    createInvoice: async (invoiceData) => {
        return await api.post('/invoice', {
            customer: invoiceData.cliente,
            customer_email: invoiceData.clienteEmail,
            customer_phone: invoiceData.clienteTelefono,
            customer_address: invoiceData.clienteDireccion,
            issue_date: invoiceData.fechaEmision,
            due_date: invoiceData.fechaVencimiento,
            items: invoiceData.items.map(item => ({
                description: item.descripcion,
                quantity: item.cantidad,
                unit_price: item.precioUnitario,
                amount: item.monto
            })),
            shipment_id: invoiceData.shipmentId
        });
    },

    updateInvoiceStatus: async (id, status) => {
        return await api.patch(`/invoice/${id}/status`, { status });
    },

    syncWithQuickBooks: async (id, quickbooksId) => {
        return await api.post(`/invoice/${id}/quickbooks`, { quickbooks_id: quickbooksId });
    },

    deleteInvoice: async (id) => {
        return await api.delete(`/invoice/${id}`);
    }
};