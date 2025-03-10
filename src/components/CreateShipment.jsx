import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Package, Trash2, MapPin, Search, Building2 } from 'lucide-react';
import { useShipments } from '../contexts/ShipmentsContext';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import SimpleMapModal from './SimpleMapModal';

// Componente de búsqueda de clientes con autocompletado
const ClientSearch = ({ value, onChange, onCreateNew }) => {
  const [query, setQuery] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef(null);

  // Inicializar la consulta con el valor actual si existe
  useEffect(() => {
    if (value) {
      setQuery(typeof value === 'string' ? value : (value.business_name || value.name || ''));
    }
  }, [value]);

  // Cargar clientes basados en la consulta
  useEffect(() => {
    const fetchClients = async () => {
      if (!query.trim() || query.length < 2) {
        setClients([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/clients?search=${encodeURIComponent(query)}`);
        if (response && response.data) {
          setClients(Array.isArray(response.data) ? response.data : []);
        } else {
          setClients([]);
        }
      } catch (error) {
        console.error('Error al buscar clientes:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchClients, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Manejar clics fuera del componente para cerrar resultados
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar cliente..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
            // Si el usuario está escribiendo, actualizar el valor como texto
            onChange(e.target.value);
          }}
          onFocus={() => setShowResults(true)}
        />
        {query && (
          <button
            type="button"
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => {
              setQuery('');
              onChange('');
            }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>
      </div>

      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Buscando clientes...</div>
          ) : clients.length > 0 ? (
            <ul>
              {clients.map((client) => (
                <li
                  key={client.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setQuery(client.business_name || client.name);
                    onChange(client);
                    setShowResults(false);
                  }}
                >
                  <div className="font-medium">{client.business_name || client.name}</div>
                  {client.tax_id && <div className="text-xs text-gray-500">{client.tax_id}</div>}
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-2">No se encontraron resultados para "{query}"</p>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                onClick={() => {
                  onCreateNew(query);
                  setShowResults(false);
                }}
              >
                <Plus className="w-4 h-4" />
                Crear nuevo cliente
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Escribe al menos 2 caracteres para buscar
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Importaciones de Leaflet y configuración del icono
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css';
import * as ELG from 'esri-leaflet-geocoder';

// Corregir los iconos de Leaflet para React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const INITIAL_SHIPMENT = {
  refCode: '', // Manual reference code
  cliente: '',
  direccionOrigen: '',
  latitudOrigen: '',
  longitudOrigen: '',
  direccionDestino: '',
  latitudDestino: '',
  longitudDestino: '',
  items: [],
  costoEnvio: 0,
  status: 'pendiente',
  fechaCreacion: new Date().toISOString(),
  pdfs: [],
  transportistaId: '',
  liftGate: 'NO',
  appointment: 'NO',
  palletJack: 'NO',
  comments: '',
  servicePrices: {
    liftGate: 15,
    appointment: 15,
    palletJack: 15
  }
};

const INITIAL_ITEM = {
  descripcion: '',
  cantidad: 1,
  pesoTotal: 0,
  valorTotal: 15,
};

// Componente que maneja los eventos del mapa
function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click: (e) => {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    }
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}
const ItemForm = ({ onAdd, className = '' }) => {
  const [item, setItem] = useState(INITIAL_ITEM);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prev) => ({
      ...prev,
      [name]:
        name === 'cantidad'
          ? parseInt(value) || 0
          : ['pesoTotal', 'valorTotal'].includes(name)
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const validateItem = () => {
    if (!item.descripcion.trim()) return 'La descripción es requerida';
    if (item.cantidad < 1) return 'La cantidad debe ser mayor a 0';
    if (item.pesoTotal <= 0) return 'El peso total debe ser mayor a 0';
    if (item.valorTotal < 0) return 'El valor total no puede ser negativo';
    return '';
  };

  const handleSubmit = () => {
    const validationError = validateItem();
    if (validationError) {
      setError(validationError);
      return;
    }
    onAdd({ ...item, id: Date.now() });
    setItem(INITIAL_ITEM);
    setError('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <input
            type="text"
            name="descripcion"
            value={item.descripcion}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad
          </label>
          <input
            type="number"
            name="cantidad"
            value={item.cantidad}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peso Total en libra (lb)
          </label>
          <input
            type="number"
            name="pesoTotal"
            value={item.pesoTotal}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor Total
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="valorTotal"
              value={item.valorTotal}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ItemsTable = ({ items, onRemove }) => {
  if (items.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
        <Package className="w-5 h-5" />
        <span>No hay items agregados</span>
      </div>
    );
  }

  const totals = items.reduce(
    (acc, item) => ({
      cantidad: acc.cantidad + item.cantidad,
      peso: acc.peso + item.pesoTotal,
      valor: acc.valor + item.valorTotal,
    }),
    { cantidad: 0, peso: 0, valor: 0 }
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Cantidad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Peso Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Valor Total
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.descripcion}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.cantidad}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.pesoTotal} lb
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${item.valorTotal.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-medium">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              Totales
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {totals.cantidad}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {totals.peso.toFixed(2)} lb
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              ${totals.valor.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export function CreateShipment({ onClose }) {
  const navigate = useNavigate();
  const { addShipment } = useShipments();
  const { user } = useAuth();
  const [shipment, setShipment] = useState(INITIAL_SHIPMENT);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [transportistas, setTransportistas] = useState([]);
  const [loadingTransportistas, setLoadingTransportistas] = useState(true);
  const [showError, setShowError] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Map selection state
  const [showOriginMap, setShowOriginMap] = useState(false);
  const [showDestinationMap, setShowDestinationMap] = useState(false);

  // Manejo de selección de cliente
  const handleSelectClient = (client) => {
    if (typeof client === 'object' && client !== null) {
      setSelectedClient(client);
      setShipment(prev => ({
        ...prev,
        cliente: client.business_name || client.name,
        clientId: client.id
      }));
    } else {
      // Si es solo texto, actualizar el nombre del cliente
      setShipment(prev => ({
        ...prev,
        cliente: client
      }));
    }
  };

  const handleCreateNewClient = (name) => {
    // Navegar a la página de creación de cliente y volver después
    navigate('/logistica/clientes/nuevo', {
      state: {
        initialName: name,
        returnPath: '/logistica/crear-envio'
      }
    });
  };

  // Manejo de servicios como items
  useEffect(() => {
    // Esta función actualiza los items relacionados con servicios
    const updateServiceItems = () => {
      // Empezamos eliminando cualquier item de servicio existente
      const regularItems = shipment.items.filter(item =>
        !['Lift Gate Service', 'Appointment Service', 'Pallet Jack Service'].includes(item.descripcion)
      );

      let serviceItems = [];

      // Agregamos los items correspondientes a los servicios seleccionados
      if (shipment.liftGate === 'YES') {
        serviceItems.push({
          id: 'service-liftgate',
          descripcion: 'Lift Gate Service',
          cantidad: 1,
          pesoTotal: 0,
          valorTotal: shipment.servicePrices.liftGate
        });
      }

      if (shipment.appointment === 'YES') {
        serviceItems.push({
          id: 'service-appointment',
          descripcion: 'Appointment Service',
          cantidad: 1,
          pesoTotal: 0,
          valorTotal: shipment.servicePrices.appointment
        });
      }

      if (shipment.palletJack === 'YES') {
        serviceItems.push({
          id: 'service-palletjack',
          descripcion: 'Pallet Jack Service',
          cantidad: 1,
          pesoTotal: 0,
          valorTotal: shipment.servicePrices.palletJack
        });
      }

      // Actualizamos la lista de items con los regulares y los de servicio
      setShipment(prev => ({
        ...prev,
        items: [...regularItems, ...serviceItems]
      }));
    };

    updateServiceItems();
  }, [shipment.liftGate, shipment.appointment, shipment.palletJack, shipment.servicePrices]);

  const handleClose = () => {
    if (
      shipment.items.length > 0 ||
      shipment.cliente ||
      shipment.direccionOrigen ||
      shipment.direccionDestino
    ) {
      if (
        window.confirm(
          '¿Estás seguro de que quieres cerrar? Se perderán los cambios no guardados.'
        )
      ) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  // Manejar cambio de precios de servicios
  const handleServicePriceChange = (service, price) => {
    setShipment(prev => ({
      ...prev,
      servicePrices: {
        ...prev.servicePrices,
        [service]: parseFloat(price) || 0
      }
    }));
  };

  useEffect(() => {
    const cargarTransportistas = async () => {
      try {
        setLoadingTransportistas(true);
        const enviosResponse = await api.get('/shipments');
        const envios = enviosResponse?.data || [];
        const usersResponse = await api.get('/users');
        const usersData = usersResponse?.data || [];
        const transportistasData = usersData
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

        setTransportistas(transportistasData);
      } catch (error) {
        console.error('Error al cargar transportistas:', error);
        setErrors((prev) => ({
          ...prev,
          transportistas:
            'Error al cargar transportistas. Por favor, recarga la página.',
        }));
      } finally {
        setLoadingTransportistas(false);
      }
    };
    cargarTransportistas();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [shipment]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setShipment((prev) => ({
      ...prev,
      [name]: name === 'costoEnvio' ? parseFloat(value) || 0 : value,
    }));
  }, []);

  const addItem = useCallback((item) => {
    // Solo agregamos items que no sean de servicio (los de servicio se manejan automáticamente)
    if (!['Lift Gate Service', 'Appointment Service', 'Pallet Jack Service'].includes(item.descripcion)) {
      setShipment((prev) => ({
        ...prev,
        items: [...prev.items, item],
      }));
    }
  }, []);

  const removeItem = useCallback((itemId) => {
    // No permitimos eliminar items de servicio directamente (se eliminan al desactivar el servicio)
    if (typeof itemId === 'string' && itemId.startsWith('service-')) {
      const serviceType = itemId.replace('service-', '');

      if (serviceType === 'liftgate') {
        setShipment(prev => ({ ...prev, liftGate: 'NO' }));
      } else if (serviceType === 'appointment') {
        setShipment(prev => ({ ...prev, appointment: 'NO' }));
      } else if (serviceType === 'palletjack') {
        setShipment(prev => ({ ...prev, palletJack: 'NO' }));
      }
    } else {
      // Para items regulares, los eliminamos normalmente
      setShipment((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== itemId),
      }));
    }
  }, []);

  const handleSelectOriginLocation = useCallback((location) => {
    setShipment((prev) => ({
      ...prev,
      direccionOrigen: location.address,
      latitudOrigen: String(location.lat),
      longitudOrigen: String(location.lng),
    }));
  }, []);

  const handleSelectDestinationLocation = useCallback((location) => {
    setShipment((prev) => ({
      ...prev,
      direccionDestino: location.address,
      latitudDestino: String(location.lat),
      longitudDestino: String(location.lng),
    }));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!shipment.refCode.trim()) newErrors.refCode = 'El código de referencia es requerido';
    if (!shipment.transportistaId) {
      newErrors.transportistaId = 'Debe seleccionar un transportista';
    }
    if (!shipment.cliente.trim()) newErrors.cliente = 'El cliente es requerido';
    if (!shipment.direccionOrigen.trim())
      newErrors.direccionOrigen = 'La dirección de origen es requerida';
    if (!shipment.direccionDestino.trim())
      newErrors.direccionDestino = 'La dirección de destino es requerida';
    if (shipment.costoEnvio <= 0)
      newErrors.costoEnvio = 'El costo de envío debe ser mayor a 0';
    if (shipment.items.length === 0)
      newErrors.items = 'Debe agregar al menos un item';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPdf = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validar tipo de archivo
      if (file.type !== 'application/pdf') {
        alert('Solo se permiten archivos PDF');
        return;
      }

      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      setShipment((prev) => ({
        ...prev,
        pdfs: [...prev.pdfs, file],
      }));

      // Limpiar el input para permitir subir el mismo archivo
      e.target.value = '';
    }
  };

  const handleRemovePdf = (index) => {
    setShipment((prev) => ({
      ...prev,
      pdfs: prev.pdfs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();

      // Agregar campos principales
      formData.append('ref_code', shipment.refCode);
      formData.append('customer', shipment.cliente);
      formData.append('origin_address', shipment.direccionOrigen);
      formData.append('origin_lat', shipment.latitudOrigen);
      formData.append('origin_lng', shipment.longitudOrigen);
      formData.append('destination_address', shipment.direccionDestino);
      formData.append('destination_lat', shipment.latitudDestino);
      formData.append('destination_lng', shipment.longitudDestino);
      formData.append('shipping_cost', shipment.costoEnvio.toString());
      formData.append('driver_id', shipment.transportistaId);
      formData.append('status', shipment.status);
      formData.append('lift_gate', shipment.liftGate);
      formData.append('appointment', shipment.appointment);
      formData.append('pallet_jack', shipment.palletJack);
      formData.append('comments', shipment.comments);

      // Si hay un cliente seleccionado, incluir su ID
      if (selectedClient && selectedClient.id) {
        formData.append('client_id', selectedClient.id);
      }

      // Transformar items para el backend
      const itemsForBackend = shipment.items.map(item => ({
        description: item.descripcion,
        quantity: item.cantidad,
        weight: item.pesoTotal,
        value: item.valorTotal
      }));
      formData.append('items', JSON.stringify(itemsForBackend));

      // Agregar los archivos PDF
      shipment.pdfs.forEach(file => {
        formData.append('documents[]', file);
      });

      const response = await api.post('/shipment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error(response.msg || 'Error al crear el envío');
      }
    } catch (error) {
      console.error('Error al crear envío:', error);
      setShowError(true);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Error al crear el envío'
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <Alert className="bg-green-100 border-green-500">
            <AlertTitle className="text-green-800 font-semibold">
              ¡Éxito!
            </AlertTitle>
            <AlertDescription className="text-green-700">
              El envío ha sido creado correctamente. Redirigiendo...
            </AlertDescription>
          </Alert>
        </div>
      )}
      {errors.transportistas && (
        <p className="mt-1 text-sm text-red-500">{errors.transportistas}</p>
      )}
      {showError && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <Alert className="bg-red-100 border-red-500">
            <AlertTitle className="text-red-800 font-semibold">Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {errors.submit || 'Ocurrió un error al crear el envío'}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Crear Nuevo Envío</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Principal */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Información Principal
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código de Referencia *
                  </label>
                  <input
                    type="text"
                    name="refCode"
                    value={shipment.refCode}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.refCode ? 'border-red-500' : ''}`}
                  />
                  {errors.refCode && (
                    <p className="mt-1 text-sm text-red-500">{errors.refCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente
                  </label>
                  <ClientSearch
                    value={selectedClient || shipment.cliente}
                    onChange={handleSelectClient}
                    onCreateNew={handleCreateNewClient}
                  />
                  {errors.cliente && (
                    <p className="mt-1 text-sm text-red-500">{errors.cliente}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo de Envío
                  </label>
                  <input
                    type="number"
                    name="costoEnvio"
                    value={shipment.costoEnvio}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.costoEnvio ? 'border-red-500' : ''
                      }`}
                    min="0"
                    step="0.01"
                  />
                  {errors.costoEnvio && (
                    <p className="mt-1 text-sm text-red-500">{errors.costoEnvio}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transportista Asignado
                  </label>
                  <select
                    name="transportistaId"
                    value={shipment.transportistaId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.transportistaId ? 'border-red-500' : ''
                      }`}
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
                  {errors.transportistaId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.transportistaId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Direcciones */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Direcciones
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Origen
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="direccionOrigen"
                      value={shipment.direccionOrigen}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.direccionOrigen ? 'border-red-500' : ''
                        }`}
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
                  {errors.direccionOrigen && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.direccionOrigen}
                    </p>
                  )}
                  {shipment.latitudOrigen && shipment.longitudOrigen && (
                    <p className="mt-1 text-xs text-gray-500">
                      Coordenadas: {Number(shipment.latitudOrigen).toFixed(6)}, {Number(shipment.longitudOrigen).toFixed(6)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Destino
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="direccionDestino"
                      value={shipment.direccionDestino}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.direccionDestino ? 'border-red-500' : ''
                        }`}
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
                  {errors.direccionDestino && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.direccionDestino}
                    </p>
                  )}
                  {shipment.latitudDestino && shipment.longitudDestino && (
                    <p className="mt-1 text-xs text-gray-500">
                      Coordenadas: {Number(shipment.latitudDestino).toFixed(6)}, {Number(shipment.longitudDestino).toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Opciones de Servicio */}
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Opciones de Servicio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lift Gate
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="liftGate"
                      value={shipment.liftGate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NO">NO</option>
                      <option value="YES">YES</option>
                    </select>
                    <input
                      type="number"
                      value={shipment.servicePrices.liftGate}
                      onChange={(e) => handleServicePriceChange('liftGate', e.target.value)}
                      className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      disabled={shipment.liftGate === 'NO'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="appointment"
                      value={shipment.appointment}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NO">NO</option>
                      <option value="YES">YES</option>
                    </select>
                    <input
                      type="number"
                      value={shipment.servicePrices.appointment}
                      onChange={(e) => handleServicePriceChange('appointment', e.target.value)}
                      className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      disabled={shipment.appointment === 'NO'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pallet Jack
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="palletJack"
                      value={shipment.palletJack}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="NO">NO</option>
                      <option value="YES">YES</option>
                    </select>
                    <input
                      type="number"
                      value={shipment.servicePrices.palletJack}
                      onChange={(e) => handleServicePriceChange('palletJack', e.target.value)}
                      className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      disabled={shipment.palletJack === 'NO'}
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentarios / Instrucciones
                  </label>
                  <textarea
                    name="comments"
                    value={shipment.comments}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Ejemplo: Llamar 1 hr antes de entrega TEL # 555-123-4567 JUAN"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Items del Envío */}
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Items del Envío
              </h3>
              <ItemForm onAdd={addItem} className="mb-4" />
              {errors.items && (
                <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {errors.items}
                </div>
              )}
              <div className="bg-white rounded-lg border border-gray-200">
                <ItemsTable items={shipment.items} onRemove={removeItem} />
              </div>
            </div>

            {/* PDFs */}
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Documentos PDF
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Máximo 5 archivos PDF (5MB por archivo)
                  </p>
                  <p className="text-sm text-gray-600">
                    {shipment.pdfs.length}/5 archivos
                  </p>
                </div>
                {shipment.pdfs.length < 5 && (
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleAddPdf}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                )}
                <div className="space-y-2">
                  {shipment.pdfs.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border"
                    >
                      <span className="text-sm text-gray-600">
                        {file.name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const url = URL.createObjectURL(file);
                            window.open(url, '_blank');
                            URL.revokeObjectURL(url);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePdf(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Botón para crear envío */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={Object.keys(errors).length > 0}
            >
              Crear Envío
            </button>
          </div>
        </form>
      </div>

      {/* Modales de Mapa */}
      <SimpleMapModal
        isOpen={showOriginMap}
        onClose={() => setShowOriginMap(false)}
        onSelectLocation={handleSelectOriginLocation}
        initialAddress={{
          address: shipment.direccionOrigen,
          lat: shipment.latitudOrigen ? parseFloat(shipment.latitudOrigen) : null,
          lng: shipment.longitudOrigen ? parseFloat(shipment.longitudOrigen) : null
        }}
      />

      <SimpleMapModal
        isOpen={showDestinationMap}
        onClose={() => setShowDestinationMap(false)}
        onSelectLocation={handleSelectDestinationLocation}
        initialAddress={{
          address: shipment.direccionDestino,
          lat: shipment.latitudDestino ? parseFloat(shipment.latitudDestino) : null,
          lng: shipment.longitudDestino ? parseFloat(shipment.longitudDestino) : null
        }}
      />
    </div>
  );
}

export default CreateShipment;