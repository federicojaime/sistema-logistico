// ShipmentList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShipments } from '../contexts/ShipmentsContext';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Check, Package } from 'lucide-react';
import ShipmentModal from './shipment-modal/ShipmentModal';
import InvoiceModal from './InvoiceModal';
import CameraPODCapture from './CameraPODCapture';
import { statusMap, statusColors, sortShipments } from '../utils/shipmentUtils';
import api from '../services/api';

// Componentes modulares
import BasicFilters from './BasicFilters';
import AdvancedFilters from './AdvancedFilters';
import ShipmentTable from './ShipmentTable';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import HeaderControls from './HeaderControls';

export function ShipmentList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    shipments,
    loading,
    error,
    refreshShipments,
    deleteShipment
  } = useShipments();

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(user.role === 'transportista' ? 'Pendiente' : 'todos');
  const [selectedDriver, setSelectedDriver] = useState('todos');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // State for modals and data
  const [modalData, setModalData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [currentShipmentForCamera, setCurrentShipmentForCamera] = useState(null);

  // State for sorting
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for data loading
  const [transportistas, setTransportistas] = useState([]);
  const [loadingTransportistas, setLoadingTransportistas] = useState(false);

  // Resetear todos los filtros
  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus(user.role === 'transportista' ? 'Pendiente' : 'todos');
    setSelectedDriver('todos');
    setDateRange({ startDate: '', endDate: '' });
    setSortField('id');
    setSortDirection('desc');
    setCurrentPage(1);
    setSuccessMessage('Filtros restablecidos');
  };

  // Sort toggle handler
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Volver a la primera página cuando se cambia el ordenamiento
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
      if (user.role !== 'admin' && user.role !== 'cliente') return;

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
          id: "99999",
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

  // Cuando se cambian los filtros, resetear a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedDriver, dateRange]);

  // Manejar la captura del PDF desde la cámara
  const handlePDFCapture = async (pdfFile) => {
    if (!pdfFile || !currentShipmentForCamera) return;

    try {
      setUploadingId(currentShipmentForCamera);

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('documents[]', pdfFile);

      // Usar el servicio existente para subir el documento
      const response = await api.post(`/shipments/${currentShipmentForCamera}/documents`, formData);

      if (response && response.ok) {
        setSuccessMessage('Documento POD capturado y subido correctamente');
        refreshShipments();
        setShowCameraModal(false);
        setCurrentShipmentForCamera(null);
      } else {
        throw new Error('Error al subir el documento capturado');
      }
    } catch (error) {
      console.error('Error al subir documento capturado:', error);
      setSuccessMessage('Error al procesar el documento capturado: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploadingId(null);
    }
  };

  // Activar el input de archivo para POD
  const handleUploadPOD = (shipmentId) => {
    // Preguntar al usuario si desea usar la cámara o subir un archivo
    const useCamera = window.confirm("¿Desea usar la cámara para capturar el POD? Seleccione 'Cancelar' para subir un archivo PDF.");

    if (useCamera) {
      // Usar la cámara
      setCurrentShipmentForCamera(shipmentId);
      setShowCameraModal(true);
    } else {
      // Usar el método original de subida de archivos
      document.getElementById(`upload-pod-${shipmentId}`).click();
    }
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
        const response = await api.post(`/shipments/${shipmentId}/documents`, formData);

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

      // Filtro por transportista
      let matchesDriver = true;

      if (user.role === 'transportista') {
        // Si es transportista, solo mostrar sus envíos asignados
        matchesDriver = shipment.driver_id === user.id;
      } else if (selectedDriver !== 'todos') {
        // Para admin/cliente con filtro seleccionado
        if (selectedDriver === '99999') {
          // Caso especial para "Sin transportista"
          matchesDriver = !shipment.driver_id;
        } else {
          // Convertir IDs a string para comparación segura
          const shipmentDriverId = String(shipment.driver_id || '');
          const selectedDriverId = String(selectedDriver || '');
          matchesDriver = shipmentDriverId === selectedDriverId;
        }
      }

      // Filtro por fecha
      let matchesDate = true;
      if (dateRange.startDate) {
        const shipmentDate = new Date(shipment.created_at);
        const startDate = new Date(dateRange.startDate);
        startDate.setHours(0, 0, 0, 0);
        if (shipmentDate < startDate) {
          matchesDate = false;
        }
      }

      if (dateRange.endDate && matchesDate) {
        const shipmentDate = new Date(shipment.created_at);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (shipmentDate > endDate) {
          matchesDate = false;
        }
      }

      return matchesSearch && matchesStatus && matchesDriver && matchesDate;
    });

    // Luego ordenar (primero por usuario)
    let sorted = sortShipments(filtered, user.role === 'transportista');

    // Ordenamiento adicional por campo seleccionado
    sorted = sorted.sort((a, b) => {
      if (sortField === 'status') {
        if (statusMap[a.status] < statusMap[b.status]) return sortDirection === 'asc' ? -1 : 1;
        if (statusMap[a.status] > statusMap[b.status]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      } else if (sortField === 'customer') {
        if (!a.customer) return sortDirection === 'asc' ? -1 : 1;
        if (!b.customer) return sortDirection === 'asc' ? 1 : -1;
        return sortDirection === 'asc'
          ? a.customer.localeCompare(b.customer)
          : b.customer.localeCompare(a.customer);
      } else if (sortField === 'destination') {
        if (!a.destination_address) return sortDirection === 'asc' ? -1 : 1;
        if (!b.destination_address) return sortDirection === 'asc' ? 1 : -1;
        return sortDirection === 'asc'
          ? a.destination_address.localeCompare(b.destination_address)
          : b.destination_address.localeCompare(a.destination_address);
      } else if (sortField === 'date') {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'driver') {
        if (!a.driver_name) return sortDirection === 'asc' ? -1 : 1;
        if (!b.driver_name) return sortDirection === 'asc' ? 1 : -1;
        return sortDirection === 'asc'
          ? a.driver_name.localeCompare(b.driver_name)
          : b.driver_name.localeCompare(a.driver_name);
      } else {
        // Default: ordenar por ID
        return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
      }
    });

    return sorted;
  }, [shipments, searchQuery, selectedStatus, selectedDriver, dateRange, user, sortField, sortDirection]);

  // Calcular la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedShipments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSortedShipments.length / itemsPerPage);

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Mostrar spinner durante la carga inicial
  if (loading && (!shipments || shipments.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header y Controles */}
      <HeaderControls 
        resetAllFilters={resetAllFilters}
        userRole={user.role}
        onCreateShipment={() => navigate('/logistica/crear-envio')}
      />

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

      {/* Contenedor de filtros con sombra y borde */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        {/* Filtros básicos */}
        <BasicFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          showAdvanced={showAdvancedFilters}
          setShowAdvanced={setShowAdvancedFilters}
          statusMap={statusMap}
        />

        {/* Filtros avanzados (condicional) */}
        {showAdvancedFilters && (
          <AdvancedFilters
            dateRange={dateRange}
            setDateRange={setDateRange}
            selectedDriver={selectedDriver}
            setSelectedDriver={setSelectedDriver}
            transportistas={transportistas}
            userRole={user.role}
          />
        )}
      </div>

      {/* Lista de Envíos */}
      {filteredAndSortedShipments.length === 0 ? (
        <EmptyState userRole={user.role} />
      ) : (
        <>
          <ShipmentTable 
            shipments={currentItems}
            sortField={sortField}
            sortDirection={sortDirection}
            toggleSort={toggleSort}
            onViewDetails={(shipment) => setModalData(shipment)}
            onShowInvoice={(shipment) => setInvoiceData(shipment)}
            onUploadPOD={handleUploadPOD}
            onDelete={handleDelete}
            uploadingId={uploadingId}
            statusColors={statusColors}
            statusMap={statusMap}
            userRole={user.role}
            handlePODUpload={handlePODUpload}
          />
          
          {/* Paginación */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
            />
          )}
        </>
      )}

      {/* Modal de Detalles */}
      {modalData && (
        <ShipmentModal
          shipment={modalData}
          onClose={() => setModalData(null)}
          userRole={user.role}
          userId={user.id}
          refreshShipments={refreshShipments}
          transportistas={transportistas}
          loadingTransportistas={loadingTransportistas}
          setSuccessMessage={setSuccessMessage}
        />
      )}

      {/* Modal de Factura */}
      {invoiceData && (
        <InvoiceModal
          shipment={invoiceData}
          onClose={() => setInvoiceData(null)}
        />
      )}

      {/* Modal de captura con cámara */}
      {showCameraModal && currentShipmentForCamera && (
        <CameraPODCapture
          shipmentId={currentShipmentForCamera}
          onCapture={handlePDFCapture}
          onClose={() => {
            setShowCameraModal(false);
            setCurrentShipmentForCamera(null);
          }}
        />
      )}
    </div>
  );
}

export default ShipmentList;