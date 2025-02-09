// src/components/Invoices.jsx
import { useState, useEffect } from 'react';
import { QuickBooksSetup } from './QuickBooksSetup';
import { InvoiceForm } from './InvoiceForm';
import QuickBooksService from '../services/quickbooksService';

const qbService = new QuickBooksService();

export function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Cargar facturas
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      // Aquí podrías cargar las facturas desde tu backend
      setInvoices([
        {
          id: 1,
          numeroFactura: 'F-2024-001',
          cliente: 'Empresa B',
          monto: 1500.00,
          estado: 'pendiente',
          fechaEmision: '2024-03-04',
          fechaVencimiento: '2024-04-04',
          sincronizadoQB: false,
          items: [
            {
              descripcion: 'Servicio de Envío',
              cantidad: 1,
              precioUnitario: 1500.00,
              monto: 1500.00
            }
          ]
        }
      ]);
    } catch (err) {
      setError('Error al cargar las facturas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    setLoading(true);
    try {
      // Añadir la nueva factura al estado
      const newInvoice = {
        id: invoices.length + 1,
        ...invoiceData,
        sincronizadoQB: false
      };
      
      setInvoices(prevInvoices => [...prevInvoices, newInvoice]);
      setShowForm(false);
    } catch (error) {
      setError('Error al crear la factura');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sincronizarConQuickBooks = async (invoice) => {
    setLoading(true);
    try {
      // 1. Buscar o crear cliente
      const clienteQB = await qbService.findOrCreateCustomer({
        nombre: invoice.cliente,
        email: invoice.clienteEmail,
        telefono: invoice.clienteTelefono,
        direccion: invoice.clienteDireccion
      });

      // 2. Preparar datos de la factura
      const invoiceData = {
        CustomerRef: {
          value: clienteQB.Id
        },
        fechaEmision: invoice.fechaEmision,
        fechaVencimiento: invoice.fechaVencimiento,
        items: invoice.items.map(item => ({
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          monto: item.monto
        }))
      };

      // 3. Crear factura en QuickBooks
      const qbInvoice = await qbService.createInvoice(invoiceData);

      // 4. Actualizar estado local
      setInvoices(prevInvoices => 
        prevInvoices.map(inv => 
          inv.id === invoice.id 
            ? { 
                ...inv, 
                sincronizadoQB: true,
                quickbooksId: qbInvoice.Id
              }
            : inv
        )
      );

      alert('Factura sincronizada exitosamente con QuickBooks');
    } catch (error) {
      console.error('Error al sincronizar con QuickBooks:', error);
      setError(`Error al sincronizar con QuickBooks: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
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

      <QuickBooksSetup />
      
      {showForm ? (
        <InvoiceForm
          onSubmit={handleCreateInvoice}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Facturas</h2>
              <div className="flex gap-2">
                {loading && (
                  <span className="text-gray-500">Cargando...</span>
                )}
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={() => setShowForm(true)}
                >
                  Nueva Factura
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nº Factura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      QuickBooks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.numeroFactura}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${invoice.monto.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          invoice.estado === 'pagada' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invoice.sincronizadoQB ? (
                          <span className="text-green-600">✓ Sincronizado</span>
                        ) : (
                          <button
                            onClick={() => sincronizarConQuickBooks(invoice)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            Sincronizar
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          onClick={() => console.log('Ver factura', invoice)}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}