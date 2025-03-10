import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Package, Trash2 } from 'lucide-react';
import { useShipments } from '../contexts/ShipmentsContext';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const INITIAL_SHIPMENT = {
  id: Date.now(),
  cliente: '',
  direccionOrigen: '',
  direccionDestino: '',
  items: [],
  costoEnvio: 0,
  status: 'pendiente',
  fechaCreacion: new Date().toISOString(),
  pdfs: [],
  transportistaId: '',
};

const INITIAL_ITEM = {
  descripcion: '',
  cantidad: 1,
  peso: 0,
  valor: 0,
};

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
          : ['peso', 'valor'].includes(name)
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const validateItem = () => {
    if (!item.descripcion.trim()) return 'La descripción es requerida';
    if (item.cantidad < 1) return 'La cantidad debe ser mayor a 0';
    if (item.peso <= 0) return 'El peso debe ser mayor a 0';
    if (item.valor < 0) return 'El valor no puede ser negativo';
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
            Peso en libra (lb)
          </label>
          <input
            type="number"
            name="peso"
            value={item.peso}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="valor"
              value={item.valor}
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
      peso: acc.peso + item.peso * item.cantidad,
      valor: acc.valor + item.valor * item.cantidad,
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
              Peso
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Valor Unit.
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
                {item.peso} lb
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${item.valor.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${(item.valor * item.cantidad).toFixed(2)}
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
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
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
  const { users } = useAuth();
  const [shipment, setShipment] = useState(INITIAL_SHIPMENT);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [transportistas, setTransportistas] = useState([]);
  const [loadingTransportistas, setLoadingTransportistas] = useState(true);
  const [showError, setShowError] = useState(false);

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
    setShipment((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));
  }, []);

  const removeItem = useCallback((itemId) => {
    setShipment((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  }, []);

  const validateForm = () => {
    const newErrors = {};
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
      formData.append('customer', shipment.cliente);
      formData.append('origin_address', shipment.direccionOrigen);
      formData.append('destination_address', shipment.direccionDestino);
      formData.append('shipping_cost', shipment.costoEnvio.toString());
      formData.append('driver_id', shipment.transportistaId);
      formData.append('status', shipment.status);

      // Transformar items para el backend
      const itemsForBackend = shipment.items.map(item => ({
        description: item.descripcion,
        quantity: item.cantidad,
        weight: item.peso,
        value: item.valor
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
                    Cliente
                  </label>
                  <input
                    type="text"
                    name="cliente"
                    value={shipment.cliente}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cliente ? 'border-red-500' : ''
                      }`}
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
                  <input
                    type="text"
                    name="direccionOrigen"
                    value={shipment.direccionOrigen}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.direccionOrigen ? 'border-red-500' : ''
                      }`}
                  />
                  {errors.direccionOrigen && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.direccionOrigen}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Destino
                  </label>
                  <input
                    type="text"
                    name="direccionDestino"
                    value={shipment.direccionDestino}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.direccionDestino ? 'border-red-500' : ''
                      }`}
                  />
                  {errors.direccionDestino && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.direccionDestino}
                    </p>
                  )}
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
    </div>
  );
}

export default CreateShipment;