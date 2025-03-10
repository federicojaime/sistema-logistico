import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Search,
    Eye,
    FileText,
    Filter,
    X,
    Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { shipmentsService } from '../services/shipmentsService';
import InvoiceModal from './InvoiceModal';
import { Alert, AlertDescription } from './ui/alert';

const statusMap = {
    'entregado': 'Entregado'
};

export function AccountantShipmentList() {
    const { user } = useAuth();
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [invoiceData, setInvoiceData] = useState(null);

    // Cargar solo envíos completados
    const loadCompletedShipments = useCallback(async () => {
        try {
            const response = await shipmentsService.getShipments({ status: 'entregado' });

            if (response.ok && Array.isArray(response.data)) {
                setShipments(response.data);
                setError(null);
            } else {
                setShipments([]);
                setError(response.msg || 'Error al obtener los envíos entregados');
            }
        } catch (err) {
            setShipments([]);
            setError('Error al cargar los envíos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCompletedShipments();
    }, [loadCompletedShipments]);

    // Filtrar envíos basado en la búsqueda
    const filteredShipments = useMemo(() => {
        if (!Array.isArray(shipments)) return [];

        return shipments.filter((shipment) => {
            const matchesSearch =
                searchQuery === '' ||
                (shipment.customer && shipment.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (shipment.destination_address && shipment.destination_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (shipment.ref_code && shipment.ref_code.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesSearch;
        });
    }, [shipments, searchQuery]);

    // Mostrar spinner de carga durante la carga inicial
    if (loading && shipments.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Envíos Finalizados</h2>
            </div>

            {/* Manejo de errores */}
            {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Búsqueda */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o lugar..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Lista de Envíos */}
            {filteredShipments.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="mb-4">
                        <Package className="h-16 w-16 mx-auto text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        No hay envíos finalizados
                    </h3>
                    <p className="text-gray-500">
                        No se encontraron envíos entregados con los filtros seleccionados.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Referencia
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Destino
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Fecha de Entrega
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredShipments.map((shipment) => (
                                    <tr key={shipment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {shipment.ref_code || `#${shipment.id.toString().padStart(6, '0')}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {shipment.customer}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {shipment.destination_address && shipment.destination_address.length > 30
                                                ? `${shipment.destination_address.substring(0, 30)}...`
                                                : shipment.destination_address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {shipment.updated_at
                                                ? new Date(shipment.updated_at).toLocaleDateString()
                                                : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center gap-2">
                                                {/* <button
                          onClick={() => window.open(`${import.meta.env.VITE_API_URL}/shipment/${shipment.id}`, '_blank')}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>*/}

                                                <button
                                                    onClick={() => setInvoiceData(shipment)}
                                                    className="text-gray-400 hover:text-green-600 transition-colors"
                                                    title="Generar Factura"
                                                >
                                                    <FileText className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Factura */}
            {invoiceData && (
                <InvoiceModal
                    shipment={invoiceData}
                    onClose={() => setInvoiceData(null)}
                />
            )}
        </div>
    );
}

export default AccountantShipmentList;