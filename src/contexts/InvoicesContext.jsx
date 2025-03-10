// src/contexts/InvoicesContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { invoicesService } from '../services/invoicesService';

const InvoicesContext = createContext();

export function InvoicesProvider({ children }) {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadInvoices = useCallback(async (filters = {}) => {
        try {
            setLoading(true);
            setError(null);
            const response = await invoicesService.getInvoices(filters);
            if (response.ok) {
                setInvoices(response.data);
            } else {
                setError(response.msg);
            }
        } catch (err) {
            setError('Error al cargar las facturas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    const createInvoice = async (invoiceData) => {
        try {
            setLoading(true);
            const response = await invoicesService.createInvoice(invoiceData);
            if (response.ok) {
                setInvoices(prev => [...prev, response.data]);
                return { success: true, data: response.data };
            }
            setError(response.msg);
            return { success: false, error: response.msg };
        } catch (err) {
            setError('Error al crear la factura');
            console.error(err);
            return { success: false, error: 'Error al crear la factura' };
        } finally {
            setLoading(false);
        }
    };

    const updateInvoiceStatus = async (id, status) => {
        try {
            setLoading(true);
            const response = await invoicesService.updateInvoiceStatus(id, status);
            if (response.ok) {
                setInvoices(prev =>
                    prev.map(invoice =>
                        invoice.id === id ? response.data : invoice
                    )
                );
                return true;
            }
            setError(response.msg);
            return false;
        } catch (err) {
            setError('Error al actualizar el estado de la factura');
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const syncWithQuickBooks = async (id, quickbooksId) => {
        try {
            setLoading(true);
            const response = await invoicesService.syncWithQuickBooks(id, quickbooksId);
            if (response.ok) {
                setInvoices(prev =>
                    prev.map(invoice =>
                        invoice.id === id ? { ...invoice, quickbooks_id: quickbooksId } : invoice
                    )
                );
                return true;
            }
            setError(response.msg);
            return false;
        } catch (err) {
            setError('Error al sincronizar con QuickBooks');
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteInvoice = async (id) => {
        try {
            setLoading(true);
            const response = await invoicesService.deleteInvoice(id);
            if (response.ok) {
                setInvoices(prev => prev.filter(invoice => invoice.id !== id));
                return true;
            }
            setError(response.msg);
            return false;
        } catch (err) {
            setError('Error al eliminar la factura');
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <InvoicesContext.Provider value={{
            invoices,
            loading,
            error,
            createInvoice,
            updateInvoiceStatus,
            syncWithQuickBooks,
            deleteInvoice,
            refreshInvoices: loadInvoices
        }}>
            {children}
        </InvoicesContext.Provider>
    );
}

export function useInvoices() {
    const context = useContext(InvoicesContext);
    if (!context) {
        throw new Error('useInvoices debe usarse dentro de InvoicesProvider');
    }
    return context;
}