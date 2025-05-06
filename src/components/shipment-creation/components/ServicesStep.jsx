// src/components/shipment-creation/components/ServicesStep.jsx
import React from 'react';
import { AlertCircle, Truck } from 'lucide-react';

const ServicesStep = ({ 
  shipment, 
  handleChange, 
  transportistas,
  loadingTransportistas,
  errors 
}) => {
  // Cambiar estado de servicios
  const handleServiceChange = (service, value) => {
    handleChange(service, value);
  };

  // Cambiar precios de servicios
  const handleServicePriceChange = (service, price) => {
    const updatedPrices = {
      ...shipment.servicePrices,
      [service]: parseFloat(price) || 0
    };
    
    handleChange('servicePrices', updatedPrices);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Servicios y Transportista</h2>
        <p className="text-sm text-gray-600">Selecciona servicios adicionales y asigna un transportista al envío.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Transportista */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <Truck className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-medium text-gray-800">Transportista Asignado</h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Transportista *
            </label>
            <select
              value={shipment.transportistaId}
              onChange={(e) => handleChange('transportistaId', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.transportistaId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              } focus:outline-none focus:ring-2 transition-colors text-gray-900`}
              disabled={loadingTransportistas}
            >
              <option value="">
                {loadingTransportistas
                  ? 'Cargando transportistas...'
                  : 'Seleccionar transportista'}
              </option>
              {transportistas.length > 0 ? (
                transportistas.map((transportista) => (
                  <option key={transportista.id} value={transportista.id}>
                    {transportista.displayName}
                  </option>
                ))
              ) : (
                <option value="" disabled>No hay transportistas disponibles</option>
              )}
            </select>
            {errors.transportistaId && (
              <p className="mt-1 text-sm text-red-500">{errors.transportistaId}</p>
            )}
          </div>
        </div>

        {/* Servicios Adicionales */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-medium text-gray-800 mb-4">Servicios Adicionales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lift Gate */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-800">Lift Gate</label>
                <select
                  value={shipment.liftGate}
                  onChange={(e) => handleServiceChange('liftGate', e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="NO">NO</option>
                  <option value="YES">YES</option>
                </select>
              </div>
              {shipment.liftGate === 'YES' && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Precio:</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={shipment.servicePrices.liftGate}
                      onChange={(e) => handleServicePriceChange('liftGate', e.target.value)}
                      className="w-full pl-8 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Appointment */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-800">Appointment</label>
                <select
                  value={shipment.appointment}
                  onChange={(e) => handleServiceChange('appointment', e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="NO">NO</option>
                  <option value="YES">YES</option>
                </select>
              </div>
              {shipment.appointment === 'YES' && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Precio:</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={shipment.servicePrices.appointment}
                      onChange={(e) => handleServicePriceChange('appointment', e.target.value)}
                      className="w-full pl-8 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Pallet Jack */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-800">Pallet Jack</label>
                <select
                  value={shipment.palletJack}
                  onChange={(e) => handleServiceChange('palletJack', e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="NO">NO</option>
                  <option value="YES">YES</option>
                </select>
              </div>
              {shipment.palletJack === 'YES' && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Precio:</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={shipment.servicePrices.palletJack}
                      onChange={(e) => handleServicePriceChange('palletJack', e.target.value)}
                      className="w-full pl-8 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comentarios */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
            <h3 className="font-medium text-gray-800">Comentarios / Instrucciones</h3>
          </div>
          
          <textarea
            value={shipment.comments}
            onChange={(e) => handleChange('comments', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Ejemplo: Llamar 1 hr antes de entrega TEL # 555-123-4567 JUAN"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default ServicesStep;