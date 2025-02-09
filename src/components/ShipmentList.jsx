import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  FileText,
  Trash2,
  Filter,
  X,
} from 'lucide-react';
import CreateShipmentForm from "./CreateShipment";
import InvoiceModal from "./InvoiceModal";

export function ShipmentList() {
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [modalData, setModalData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const shipments = [
    {
      id: 1,
      cityZipCode: 'ORLANDO',
      delivery: 'CHANEL INC',
      pickup: 'SANTA ANA SYSTEMS',
      name: 'AMANDA',
      customer: 'SCHENEIDER',
      carrier: 'NAQLOG',
      ref: '1209857695',
      pcsWeight: '1 PC / 90 LBS',
      lg: 'NO',
      extra: 'NO',
      vehicle: 'LIMO',
      hrs: '1 PM',
      contact: 'MARIA APPT / DELIVERY ON FRIDAY',
      estado: 'Pendiente',
    },
    {
      id: 2,
      cityZipCode: 'TAMPA',
      delivery: 'EMBARQ',
      pickup: 'ST GEORGE IS',
      name: 'ARTURO',
      customer: 'SCHENEIDER',
      carrier: 'HUAWEE LOG',
      ref: '1234567890',
      pcsWeight: '3 PCS / 150 LBS',
      lg: 'NO',
      extra: 'NO',
      vehicle: 'TRUCK',
      hrs: 'ETA 3 PM',
      contact: 'POSITIVE',
      estado: 'En tránsito',
    },
    {
      id: 3,
      cityZipCode: 'FULLERTON',
      delivery: 'ATLAS',
      pickup: 'THALIA',
      name: 'THALIA',
      customer: 'SCHENEIDER',
      carrier: 'NAQLOG',
      ref: '0052309876',
      pcsWeight: '4 PCS / 200 LBS',
      lg: 'NO',
      extra: 'NO',
      vehicle: 'TRUCK',
      hrs: 'ATTEMPTED PM',
      contact: '',
      estado: 'Entregado',
    },
  ];

  const statusColors = {
    Pendiente: 'bg-yellow-100 text-yellow-800',
    'En tránsito': 'bg-blue-100 text-blue-800',
    Entregado: 'bg-green-100 text-green-800',
    Cancelado: 'bg-red-100 text-red-800',
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      (selectedStatus === 'todos' || shipment.estado === selectedStatus) &&
      (shipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shipment.customer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const fieldGroups = {
    'Información Principal': ['name', 'customer', 'ref', 'estado'],
    'Detalles de Ubicación': ['cityZipCode', 'delivery', 'pickup'],
    'Información de Envío': ['carrier', 'pcsWeight', 'vehicle', 'hrs'],
    'Detalles Adicionales': ['lg', 'extra', 'contact'],
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Envíos</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Envío
        </button>
      </div>

      {isCreating ? (
        <CreateShipmentForm onClose={() => setIsCreating(false)} />
      ) : (
        <div>
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente o lugar..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                className="flex-1 py-2 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="En tránsito">En tránsito</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lugar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{shipment.id.toString().padStart(6, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {shipment.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shipment.cityZipCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[shipment.estado]}`}
                        >
                          {shipment.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver detalles"
                            onClick={() => {
                              setModalData(shipment);
                              setEditData({ ...shipment });
                            }}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Factura"
                            onClick={() => setInvoiceData(shipment)}
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mejorado */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Detalles del Envío #{modalData.id.toString().padStart(6, '0')}
              </h2>
              <button
                onClick={() => setModalData(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(fieldGroups).map(([groupTitle, fields]) => (
                  <div key={groupTitle} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      {groupTitle}
                    </h3>
                    <div className="space-y-4">
                      {fields.map((field) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                          </label>
                          {field === 'estado' ? (
                            <select
                              value={editData[field]}
                              onChange={(e) => handleEditChange(field, e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="En tránsito">En tránsito</option>
                              <option value="Entregado">Entregado</option>
                              <option value="Cancelado">Cancelado</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={editData[field]}
                              onChange={(e) => handleEditChange(field, e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setModalData(null)}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // Aquí puedes manejar la lógica para guardar los cambios
                    setModalData(null);
                  }}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceData && (
        <InvoiceModal
          shipment={invoiceData}
          onClose={() => setInvoiceData(null)}
        />
      )}
    </div>
  );
}

export default ShipmentList;