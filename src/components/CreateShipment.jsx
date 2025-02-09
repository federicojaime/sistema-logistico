import React, { useState, useCallback } from 'react';
import { X, Plus, Package, Trash2 } from 'lucide-react';

const INITIAL_SHIPMENT = {
  id: Date.now(),
  cliente: '',
  direccionOrigen: '',
  direccionDestino: '',
  items: [],
  costoEnvio: 0,
  estado: 'Pendiente',
  fechaCreacion: new Date().toISOString(),
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
    setItem(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? parseInt(value) || 0 : 
              ['peso', 'valor'].includes(name) ? parseFloat(value) || 0 : value
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
            Peso (kg)
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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

  const totals = items.reduce((acc, item) => ({
    cantidad: acc.cantidad + item.cantidad,
    peso: acc.peso + (item.peso * item.cantidad),
    valor: acc.valor + (item.valor * item.cantidad)
  }), { cantidad: 0, peso: 0, valor: 0 });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Unit.</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.descripcion}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cantidad}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.peso} kg</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.valor.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(item.valor * item.cantidad).toFixed(2)}</td>
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
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Totales</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totals.cantidad}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totals.peso.toFixed(2)} kg</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${totals.valor.toFixed(2)}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export function CreateShipment({ onClose, onSubmit }) {
  const [shipment, setShipment] = useState(INITIAL_SHIPMENT);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setShipment(prev => ({
      ...prev,
      [name]: name === 'costoEnvio' ? parseFloat(value) || 0 : value
    }));
  }, []);

  const addItem = useCallback((item) => {
    setShipment(prev => ({
      ...prev,
      items: [...prev.items, item],
    }));
  }, []);

  const removeItem = useCallback((itemId) => {
    setShipment(prev => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!shipment.cliente.trim()) newErrors.cliente = 'El cliente es requerido';
    if (!shipment.direccionOrigen.trim()) newErrors.direccionOrigen = 'La dirección de origen es requerida';
    if (!shipment.direccionDestino.trim()) newErrors.direccionDestino = 'La dirección de destino es requerida';
    if (shipment.costoEnvio <= 0) newErrors.costoEnvio = 'El costo de envío debe ser mayor a 0';
    if (shipment.items.length === 0) newErrors.items = 'Debe agregar al menos un item';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    onSubmit?.(shipment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Crear Nuevo Envío</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cliente ? 'border-red-500' : ''
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.costoEnvio ? 'border-red-500' : ''
                    }`}
                    min="0"
                    step="0.01"
                  />
                  {errors.costoEnvio && (
                    <p className="mt-1 text-sm text-red-500">{errors.costoEnvio}</p>
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.direccionOrigen ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.direccionOrigen && (
                    <p className="mt-1 text-sm text-red-500">{errors.direccionOrigen}</p>
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.direccionDestino ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.direccionDestino && (
                    <p className="mt-1 text-sm text-red-500">{errors.direccionDestino}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
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
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Envío
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateShipment;