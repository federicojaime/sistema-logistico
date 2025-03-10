import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { shipmentsService } from '../services/shipmentsService';
import InvoiceModal from './InvoiceModal';

export function AccountantView() {
  const { user } = useAuth();
  const [deliveredShipments, setDeliveredShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [selectedClient, setSelectedClient] = useState('todos');
  const [clients, setClients] = useState([]);

  // Cargar envíos entregados
  useEffect(() => {
    const loadDeliveredShipments = async () => {
      try {
        setLoading(true);
        const response = await shipmentsService.getShipments({ status: 'entregado' });
        
        if (response.ok && Array.isArray(response.data)) {
          setDeliveredShipments(response.data);
          
          // Extraer clientes únicos para el filtro
          const uniqueClients = [...new Set(response.data.map(shipment => shipment.customer))];
          setClients(uniqueClients);
        } else {
          setError('Error al cargar los envíos entregados');
        }
      } catch (err) {
        setError('Error al conectar con el servidor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDeliveredShipments();
  }, []);

  // Filtrar envíos
  const filteredShipments = deliveredShipments.filter(shipment => {
    const matchesSearch = 
      searchQuery === '' || 
      (shipment.customer && shipment.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (shipment.ref_code && shipment.ref_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (shipment.destination_address && shipment.destination_address.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesClient = 
      selectedClient === 'todos' || 
      shipment.customer === selectedClient;
    
    return matchesSearch && matchesClient;
  });

  // Mostrar spinner durante la carga inicial
  if (loading && deliveredShipments.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Envíos Listos para Facturar</h2>
      </div>

      {/* Mensajes de error y éxito */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-500">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cliente o referencia..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            className="flex-1 py-2 px-3 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="todos">Todos los clientes</option>
            {clients.map(client => (
              <option key={client} value={client}>{client}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Envíos Entregados */}
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
                  Fecha Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  POD
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No hay envíos entregados para mostrar
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => {
                  // Verificar si tiene POD (documento de prueba de entrega)
                  const hasPOD = shipment.documents && shipment.documents.some(doc => doc.name && doc.name.toLowerCase().includes('pod'));
                  
                  return (
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
                        {shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hasPOD ? (
                          <span className="text-green-600">✓ Disponible</span>
                        ) : (
                          <span className="text-red-600">✗ No disponible</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setInvoiceData(shipment)}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Ver Factura"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL}/shipment/${shipment.id}`, '_blank')}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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

export default AccountantView;