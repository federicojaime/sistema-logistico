import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Plus,
  Eye,
  FileText,
  Trash2,
  Filter,
  X,
  Upload,
  Check,
  AlertCircle,
  Package,
  Download,
  Edit,
  Save,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShipments } from '../contexts/ShipmentsContext';
import { useAuth } from '../contexts/AuthContext';
import InvoiceModal from './InvoiceModal';
import { Alert, AlertDescription } from './ui/alert';
import { shipmentsService } from '../services/shipmentsService';
import SimpleMapModal from './SimpleMapModal';
import api from '../services/api';

const statusMap = {
  'pendiente': 'Pendiente',
  'en_transito': 'En tránsito',
  'entregado': 'Entregado',
  'cancelado': 'Cancelado'
};

const reverseStatusMap = {
  'Pendiente': 'pendiente',
  'En tránsito': 'en_transito',
  'Entregado': 'entregado',
  'Cancelado': 'cancelado'
};

const statusColors = {
  'Pendiente': 'bg-yellow-100 text-yellow-800',
  'En tránsito': 'bg-blue-100 text-blue-800',
  'Entregado': 'bg-green-100 text-green-800',
  'Cancelado': 'bg-red-100 text-red-800'
};

// Función para el ordenamiento de envíos
const sortShipments = (shipments, isTransportista) => {
  // Orden de prioridad para transportistas: pendiente > en_transito > entregado > cancelado
  const statusPriority = {
    'pendiente': 0,
    'en_transito': 1,
    'entregado': 2,
    'cancelado': 3
  };

  return [...shipments].sort((a, b) => {
    // Para transportistas, ordenar primero por estado
    if (isTransportista) {
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
    }

    // Ordenar por ID (más nuevos primero)
    return b.id - a.id;
  });
};

export function ShipmentList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    shipments,
    loading,
    error,
    refreshShipments,
    updateShipment,
    deleteShipment
  } = useShipments();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(user.role === 'transportista' ? 'Pendiente' : 'todos');
  const [modalData, setModalData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [transportistas, setTransportistas] = useState([]);
  const [loadingTransportistas, setLoadingTransportistas] = useState(false);
  const [showOriginMap, setShowOriginMap] = useState(false);
  const [showDestinationMap, setShowDestinationMap] = useState(false);

  // Función común para verificar si un envío puede ser editado
  const canEdit = (shipment) => {
    if (!shipment) return false;
    return shipment.status !== 'entregado' && shipment.status !== 'cancelado';
  };

  // Verificar si el transportista puede editar este envío
  const canTransportistaEdit = (shipment) => {
    if (user.role !== 'transportista') return canEdit(shipment);
    return canEdit(shipment);
  };

  // Verificar si se puede mostrar la factura
  const canShowInvoice = (shipment) => {
    return user.role === 'admin' && shipment.status === 'entregado';
  };

  // Efecto para limpiar mensajes de éxito después de un tiempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Cargar transportistas
  useEffect(() => {
    const cargarTransportistas = async () => {
      if (user.role !== 'admin') return;

      try {
        setLoadingTransportistas(true);
        const enviosResponse = await api.get('/shipments');
        const envios = enviosResponse?.data || [];
        const usersResponse = await api.get('/users');
        const usersData = usersResponse?.data || [];

        let transportistasData = usersData
          .filter((user) => user.role === 'transportista')
          .map((transportista) => {
            const enviosPendientes = envios.filter(
              (envio) =>
                envio.driver_id === transportista.id &&
                envio.status === 'pendiente'
            ).length;

            return {
              ...transportista,
              enviosPendientes,
              name: `${transportista.firstname} ${transportista.lastname}`,
              displayName: `${transportista.firstname} ${transportista.lastname} (${enviosPendientes} envíos pendientes)`,
            };
          });

        // Ordenar transportistas por cantidad de envíos pendientes (de menor a mayor)
        transportistasData = transportistasData.sort((a, b) =>
          a.enviosPendientes - b.enviosPendientes
        );

        // Añadir la opción "Sin Transportista" al principio de la lista
        transportistasData.unshift({
          id: 99999,
          enviosPendientes: 0,
          name: "Sin Transportista",
          displayName: "Sin Transportista (0 envíos pendientes)",
        });

        setTransportistas(transportistasData);
      } catch (error) {
        console.error('Error al cargar transportistas:', error);
      } finally {
        setLoadingTransportistas(false);
      }
    };

    cargarTransportistas();
  }, [user.role]);
  // Inicializar datos de edición cuando se abre el modal
  useEffect(() => {
    if (modalData && !editData) {
      setEditData({
        ...modalData,
        items: modalData.items ? [...modalData.items] : []
      });
    }
  }, [modalData]);

  // Manejar cambios en campos de envío
  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar la selección de ubicación de origen
  const handleSelectOriginLocation = (location) => {
    setEditData(prev => ({
      ...prev,
      origin_address: location.address,
      origin_lat: location.lat,
      origin_lng: location.lng
    }));
  };

  // Manejar la selección de ubicación de destino
  const handleSelectDestinationLocation = (location) => {
    setEditData(prev => ({
      ...prev,
      destination_address: location.address,
      destination_lat: location.lat,
      destination_lng: location.lng
    }));
  };

  // Manejar cambios en items
  const handleItemChange = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
      )
    }));
  };

  // Agregar nuevo item
  const handleAddItem = () => {
    setEditData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { description: '', quantity: 1, weight: 0, value: 0 }
      ]
    }));
  };

  // Eliminar item
  const handleRemoveItem = (index) => {
    setEditData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Guardar cambios
  const handleSaveChanges = async () => {
    try {
      // Asegúrate de que todos los campos necesarios estén presentes
      if (!editData.origin_address || !editData.destination_address) {
        setSuccessMessage('Las direcciones de origen y destino son obligatorias');
        return;
      }

      // Crear una copia del objeto para modificar los valores
      const dataToSend = {
        ...editData,
        // Convertir explícitamente a strings
        origin_lat: String(editData.origin_lat),
        origin_lng: String(editData.origin_lng),
        destination_lat: String(editData.destination_lat),
        destination_lng: String(editData.destination_lng)
      };

      const response = await shipmentsService.updateShipment(editData.id, dataToSend);
      if (response && (response.ok || response.status === 200)) {
        setSuccessMessage('Envío actualizado correctamente');
        refreshShipments();
        setIsEditing(false);
        setModalData(editData);
      } else {
        throw new Error('Error al actualizar envío');
      }
    } catch (error) {
      console.error('Error al actualizar envío:', error);
      setSuccessMessage('Error al actualizar envío: ' + (error.message || 'Error desconocido'));
    }
  };

  // Subir archivo
  const handleFileUpload = async (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      const formData = new FormData();
      formData.append('documents[]', file);

      try {
        setUploadingId(modalData.id);
        const response = await shipmentsService.uploadShipmentDocument(modalData.id, formData);

        if (response && response.ok) {
          setSuccessMessage('Documento subido correctamente');
          refreshShipments();
          const updatedShipment = await shipmentsService.getShipment(modalData.id);
          if (updatedShipment && updatedShipment.ok) {
            setModalData(updatedShipment.data);
            setEditData(updatedShipment.data);
          }
        } else {
          throw new Error('Error al subir documento');
        }
      } catch (error) {
        console.error('Error al subir documento:', error);
        setSuccessMessage('Error al subir documento: ' + (error.message || 'Error desconocido'));
      } finally {
        setUploadingId(null);
      }
    }
  };

  // Activar el input de archivo para POD
  const handleUploadPOD = (shipmentId) => {
    document.getElementById(`upload-pod-${shipmentId}`).click();
  };

  // Cargar POD directamente desde la lista
  const handlePODUpload = async (e, shipmentId) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      const formData = new FormData();
      formData.append('documents[]', file);

      try {
        setUploadingId(shipmentId);
        const response = await shipmentsService.uploadShipmentDocument(shipmentId, formData);

        if (response && response.ok) {
          setSuccessMessage('POD subido correctamente');
          refreshShipments();
        } else {
          throw new Error('Error al subir POD');
        }
      } catch (error) {
        console.error('Error al subir POD:', error);
        setSuccessMessage('Error al subir POD: ' + (error.message || 'Error desconocido'));
      } finally {
        setUploadingId(null);
      }
    }
  };

  // Eliminar documento
  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este documento?')) {
      try {
        const response = await shipmentsService.deleteDocument(documentId);
        if (response && response.ok) {
          setSuccessMessage('Documento eliminado correctamente');
          refreshShipments();
          const updatedShipment = await shipmentsService.getShipment(modalData.id);
          if (updatedShipment && updatedShipment.ok) {
            setModalData(updatedShipment.data);
            setEditData(updatedShipment.data);
          }
        } else {
          throw new Error('Error al eliminar documento');
        }
      } catch (error) {
        console.error('Error al eliminar documento:', error);
        setSuccessMessage('Error al eliminar documento: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  // Filtrar y ordenar envíos
  const filteredAndSortedShipments = useMemo(() => {
    // Asegurarse que shipments es un array
    if (!Array.isArray(shipments)) return [];

    // Primero filtrar
    const filtered = shipments.filter((shipment) => {
      // Verificar que shipment tenga todas las propiedades necesarias
      if (!shipment) return false;

      const matchesSearch =
        searchQuery === '' ||
        (shipment.customer && shipment.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (shipment.destination_address && shipment.destination_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (shipment.ref_code && shipment.ref_code.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        selectedStatus === 'todos' ||
        (shipment.status && statusMap[shipment.status] === selectedStatus);

      const matchesDriver =
        user.role !== 'transportista' ||
        (shipment.driver_id && shipment.driver_id === user.id);

      return matchesSearch && matchesStatus && matchesDriver;
    });

    // Luego ordenar
    return sortShipments(filtered, user.role === 'transportista');
  }, [shipments, searchQuery, selectedStatus, user]);

  // Cambiar estado del envío
  const handleStatusChange = async (shipment, newStatus) => {
    // Verificar si el transportista puede cambiar el estado
    if (user.role === 'transportista' &&
      (shipment.status === 'entregado' || shipment.status === 'cancelado')) {
      setSuccessMessage('No se puede modificar un envío entregado o cancelado');
      setEditingStatus(null);
      return;
    }

    try {
      const updatedShipment = {
        ...shipment,
        status: reverseStatusMap[newStatus]
      };

      const success = await updateShipment(updatedShipment);

      if (success) {
        setSuccessMessage('Estado actualizado correctamente');
        setEditingStatus(null);
      } else {
        throw new Error('Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setSuccessMessage('Error al actualizar estado: ' + (error.message || 'Error desconocido'));
    }
  };

  // Cambiar transportista del envío
  const handleDriverChange = async (shipment, newDriverId) => {
    try {
      const selectedDriver = transportistas.find(t => t.id === parseInt(newDriverId));

      const updatedShipment = {
        ...shipment,
        driver_id: parseInt(newDriverId) || null,
        driver_name: selectedDriver ? `${selectedDriver.firstname} ${selectedDriver.lastname}` : 'No asignado'
      };

      const success = await updateShipment(updatedShipment);

      if (success) {
        setSuccessMessage('Transportista actualizado correctamente');
        refreshShipments();
        setEditingDriver(null);
      } else {
        throw new Error('Error al actualizar transportista');
      }
    } catch (error) {
      console.error('Error al actualizar transportista:', error);
      setSuccessMessage('Error al actualizar transportista: ' + (error.message || 'Error desconocido'));
    }
  };

  // Eliminar envío
  const handleDelete = async (shipmentId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este envío?')) {
      try {
        const success = await deleteShipment(shipmentId);
        if (success) {
          setSuccessMessage('Envío eliminado correctamente');
        } else {
          throw new Error('Error al eliminar envío');
        }
      } catch (error) {
        console.error('Error al eliminar envío:', error);
        setSuccessMessage('Error al eliminar envío: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  // Mostrar spinner durante la carga inicial
  if (loading && (!shipments || shipments.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header y Controles */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Envíos</h2>

        {user.role === 'admin' && (
          <button
            onClick={() => navigate('/logistica/crear-envio')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                     flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Crear Envío
          </button>
        )}
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
            placeholder="Buscar por cliente o lugar..."
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            {Object.values(statusMap).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Envíos */}
      {filteredAndSortedShipments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mb-4">
            <Package className="h-16 w-16 mx-auto text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay envíos para mostrar
          </h3>
          <p className="text-gray-500">
            {user.role === 'transportista'
              ? 'Actualmente no tienes envíos asignados.'
              : 'No se encontraron envíos con los filtros seleccionados.'}
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
                  {user.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Transportista
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedShipments.map((shipment) => (
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
                    {user.role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingDriver === shipment.id ? (
                          <select
                            className="rounded-lg border border-gray-300 text-sm p-1 w-full"
                            value={shipment.driver_id || ''}
                            onChange={(e) => handleDriverChange(shipment, e.target.value)}
                            onBlur={() => setEditingDriver(null)}
                          >
                            <option value="">Seleccionar transportista</option>
                            {transportistas.map((transportista) => (
                              <option key={transportista.id} value={transportista.id}>
                                {transportista.displayName}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                  bg-blue-100 text-blue-800 ${canEdit(shipment) ? 'cursor-pointer' : ''}`}
                            onClick={() => canEdit(shipment) && setEditingDriver(shipment.id)}
                          >
                            {shipment.driver_name || 'No asignado'}
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingStatus === shipment.id && canTransportistaEdit(shipment) ? (
                        <select
                          className="rounded-lg border border-gray-300 text-sm p-1"
                          value={statusMap[shipment.status]}
                          onChange={(e) => handleStatusChange(shipment, e.target.value)}
                          onBlur={() => setEditingStatus(null)}
                        >
                          {Object.values(statusMap).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${statusColors[statusMap[shipment.status]]}`}
                          onClick={() => user.role === 'transportista' && canTransportistaEdit(shipment) && setEditingStatus(shipment.id)}
                          style={{ cursor: (user.role === 'transportista' && canTransportistaEdit(shipment)) ? 'pointer' : 'default' }}
                        >
                          {statusMap[shipment.status]}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => setModalData(shipment)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* Mostrar factura solo si es admin y el envío está entregado */}
                        {canShowInvoice(shipment) && (
                          <button
                            onClick={() => setInvoiceData(shipment)}
                            className="text-gray-400 hover:text-green-600 transition-colors"
                            title="Factura"
                          >
                            <FileText className="w-5 h-5" />
                          </button>
                        )}

                        {user.role === 'transportista' &&
                          canTransportistaEdit(shipment) && (
                            <>
                              <button
                                onClick={() => handleUploadPOD(shipment.id)}
                                className="text-gray-400 hover:text-green-600 transition-colors"
                                title="Subir POD"
                                disabled={uploadingId === shipment.id}
                              >
                                {uploadingId === shipment.id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />
                                ) : (
                                  <Upload className="w-5 h-5" />
                                )}
                              </button>
                              <input
                                id={`upload-pod-${shipment.id}`}
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => handlePODUpload(e, shipment.id)}
                              />
                            </>
                          )}

                        {user.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(shipment.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Detalles del Envío {modalData.ref_code || `#${modalData.id.toString().padStart(6, '0')}`}
              </h2>
              <div className="flex gap-2">
                {((user.role === 'admin' && canEdit(modalData)) ||
                  (user.role === 'transportista' && canTransportistaEdit(modalData))) && (
                    <button
                      onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
                      className={`px-4 py-2 rounded-lg transition-colors ${isEditing
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          <span>Guardar</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </div>
                      )}
                    </button>
                  )}
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setModalData(null);
                    setEditData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Cliente</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.customer}
                      onChange={(e) => handleEditChange('customer', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p>{modalData.customer}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Estado</h3>
                  {isEditing ? (
                    <select
                      value={editData.status}
                      onChange={(e) => handleEditChange('status', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(statusMap).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[statusMap[modalData.status]]}`}>
                      {statusMap[modalData.status]}
                    </span>
                  )}
                </div>

                {user.role === 'admin' && (
                  <div>
                    <h3 className="font-semibold mb-2">Transportista Asignado</h3>
                    {isEditing && canEdit(modalData) ? (
                      <select
                        value={editData.driver_id || ''}
                        onChange={(e) => handleEditChange('driver_id', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loadingTransportistas}
                      >
                        <option value="">
                          {loadingTransportistas
                            ? 'Cargando transportistas...'
                            : 'Seleccionar transportista'}
                        </option>
                        {transportistas.map((transportista) => (
                          <option key={transportista.id} value={transportista.id}>
                            {transportista.displayName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p>{modalData.driver_name || 'No asignado'}</p>
                    )}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Dirección Origen</h3>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.origin_address}
                        onChange={(e) => handleEditChange('origin_address', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => setShowOriginMap(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <p>{modalData.origin_address}</p>
                  )}
                  {editData?.origin_lat && (
                    <p className="mt-1 text-xs text-gray-500">
                      Coordenadas: {Number(editData.origin_lat).toFixed(6)}, {Number(editData.origin_lng).toFixed(6)}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Dirección Destino</h3>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editData.destination_address}
                        onChange={(e) => handleEditChange('destination_address', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={() => setShowDestinationMap(true)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <p>{modalData.destination_address}</p>
                  )}
                  {editData?.destination_lat && (
                    <p className="mt-1 text-xs text-gray-500">
                      Coordenadas: {parseFloat(editData.destination_lat).toFixed(6)}, {parseFloat(editData.destination_lng).toFixed(6)}
                    </p>
                  )}
                </div>

                {isEditing && user.role === 'admin' && canEdit(modalData) && (
                  <div>
                    <h3 className="font-semibold mb-2">Costo de Envío</h3>
                    <input
                      type="number"
                      value={editData.shipping_cost || 0}
                      onChange={(e) => handleEditChange('shipping_cost', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              {/* Documentos */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Documentos</h3>
                  {((user.role === 'admin' && canEdit(modalData)) ||
                    (user.role === 'transportista' && canTransportistaEdit(modalData))) && (
                      <button
                        onClick={() => document.getElementById('uploadPdf').click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                      flex items-center gap-2 transition-colors text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        Subir PDF
                      </button>
                    )}
                  <input
                    id="uploadPdf"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="space-y-2">
                  {modalData.documents && modalData.documents.length > 0 ? (
                    modalData.documents.map((doc, index) => (
                      <div key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm flex-1">{doc.name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL}/shipment/document/${doc.id}`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm">Ver</span>
                          </button>

                          <a
                            href={`${import.meta.env.VITE_API_URL}/shipment/document/${doc.id}`}
                            download
                            className="text-green-600 hover:text-green-800 flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Descargar</span>
                          </a>

                          {((user.role === 'admin' && canEdit(modalData)) ||
                            (user.role === 'transportista' && canTransportistaEdit(modalData))) && (
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-red-600 hover:text-red-800 flex items-center gap-1"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm">Eliminar</span>
                              </button>
                            )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay documentos adjuntos</p>
                  )}
                </div>
              </div>

              {/* Items - Solo mostrar valores si es admin */}
              {modalData.items && modalData.items.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Items del Envío</h3>
                    {isEditing && user.role === 'admin' && canEdit(modalData) && (
                      <button
                        onClick={handleAddItem}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                            flex items-center gap-2 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Item
                      </button>
                    )}
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Descripción</th>
                        <th className="px-4 py-2 text-right">Cantidad</th>
                        <th className="px-4 py-2 text-right">Peso</th>
                        {user.role === 'admin' && (
                          <th className="px-4 py-2 text-right">Valor</th>
                        )}
                        {isEditing && user.role === 'admin' && canEdit(modalData) && <th className="px-4 py-2 text-right">Acciones</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(isEditing && user.role === 'admin' && canEdit(modalData) ? editData.items : modalData.items).map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">
                            {isEditing && user.role === 'admin' && canEdit(modalData) ? (
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                className="w-full px-2 py-1 border rounded"
                              />
                            ) : (
                              item.description
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {isEditing && user.role === 'admin' && canEdit(modalData) ? (
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                className="w-20 px-2 py-1 border rounded text-right"
                                min="1"
                              />
                            ) : (
                              item.quantity
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {isEditing && user.role === 'admin' && canEdit(modalData) ? (
                              <input
                                type="number"
                                value={item.weight}
                                onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                                className="w-20 px-2 py-1 border rounded text-right"
                                min="0"
                                step="0.1"
                              />
                            ) : (
                              `${item.weight} kg`
                            )}
                          </td>
                          {user.role === 'admin' && (
                            <td className="px-4 py-2 text-right">
                              {isEditing && canEdit(modalData) ? (
                                <input
                                  type="number"
                                  value={item.value}
                                  onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                                  className="w-24 px-2 py-1 border rounded text-right"
                                  min="0"
                                  step="0.01"
                                />
                              ) : (
                                `${item.value}`
                              )}
                            </td>
                          )}
                          {isEditing && user.role === 'admin' && canEdit(modalData) && (
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {/* Fila de Total */}
                      <tr className="font-semibold border-t">
                        <td colSpan="2" className="px-4 py-2 text-right">Total:</td>
                        <td className="px-4 py-2 text-right">
                          {(isEditing ? editData.items : modalData.items).reduce((total, item) => total + (parseFloat(item.weight) * parseFloat(item.quantity)), 0).toFixed(2)} kg
                        </td>
                        {user.role === 'admin' && (
                          <td className="px-4 py-2 text-right">
                            ${(isEditing ? editData.items : modalData.items).reduce((total, item) => total + (parseFloat(item.value) * parseFloat(item.quantity)), 0).toFixed(2)}
                          </td>
                        )}
                        {isEditing && user.role === 'admin' && canEdit(modalData) && <td></td>}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Factura - Solo muestra cuando el estado es entregado */}
      {invoiceData && (
        <InvoiceModal
          shipment={invoiceData}
          onClose={() => setInvoiceData(null)}
        />
      )}

      {/* Modales de Mapa */}
      {isEditing && (
        <>
          <SimpleMapModal
            isOpen={showOriginMap}
            onClose={() => setShowOriginMap(false)}
            onSelectLocation={handleSelectOriginLocation}
            initialAddress={{
              address: editData.origin_address,
              lat: editData.origin_lat || null,
              lng: editData.origin_lng || null
            }}
          />

          <SimpleMapModal
            isOpen={showDestinationMap}
            onClose={() => setShowDestinationMap(false)}
            onSelectLocation={handleSelectDestinationLocation}
            initialAddress={{
              address: editData.destination_address,
              lat: editData.destination_lat || null,
              lng: editData.destination_lng || null
            }}
          />
        </>
      )}
    </div>
  );
}

export default ShipmentList;