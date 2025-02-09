// src/components/InvoiceForm.jsx
import { useState } from 'react';

export function InvoiceForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    cliente: '',
    clienteEmail: '',
    clienteTelefono: '',
    clienteDireccion: '',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    items: [
      {
        descripcion: '',
        cantidad: 1,
        precioUnitario: 0,
        monto: 0
      }
    ]
  });

  const [errors, setErrors] = useState({});

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Actualizar el monto automáticamente
    if (field === 'cantidad' || field === 'precioUnitario') {
      newItems[index].monto = newItems[index].cantidad * newItems[index].precioUnitario;
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        descripcion: '',
        cantidad: 1,
        precioUnitario: 0,
        monto: 0
      }]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.cliente) newErrors.cliente = 'El cliente es requerido';
    if (!formData.fechaEmision) newErrors.fechaEmision = 'La fecha de emisión es requerida';
    if (!formData.fechaVencimiento) newErrors.fechaVencimiento = 'La fecha de vencimiento es requerida';
    
    if (formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un ítem';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.descripcion) newErrors[`item${index}_descripcion`] = 'La descripción es requerida';
        if (item.cantidad <= 0) newErrors[`item${index}_cantidad`] = 'La cantidad debe ser mayor a 0';
        if (item.precioUnitario <= 0) newErrors[`item${index}_precioUnitario`] = 'El precio debe ser mayor a 0';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const total = formData.items.reduce((sum, item) => sum + item.monto, 0);
      const invoiceData = {
        ...formData,
        monto: total,
        estado: 'pendiente',
        numeroFactura: `F-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
      };
      onSubmit(invoiceData);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Nueva Formulario</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Datos del Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente *</label>
            <input
              type="text"
              value={formData.cliente}
              onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Nombre del cliente"
            />
            {errors.cliente && <span className="text-red-500 text-xs">{errors.cliente}</span>}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.clienteEmail}
              onChange={(e) => setFormData({ ...formData, clienteEmail: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Email del cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="text"
              value={formData.clienteTelefono}
              onChange={(e) => setFormData({ ...formData, clienteTelefono: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Teléfono del cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input
              type="text"
              value={formData.clienteDireccion}
              onChange={(e) => setFormData({ ...formData, clienteDireccion: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Dirección del cliente"
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Emisión *</label>
            <input
              type="date"
              value={formData.fechaEmision}
              onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
              className="w-full p-2 border rounded"
            />
            {errors.fechaEmision && <span className="text-red-500 text-xs">{errors.fechaEmision}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Vencimiento *</label>
            <input
              type="date"
              value={formData.fechaVencimiento}
              onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
              className="w-full p-2 border rounded"
            />
            {errors.fechaVencimiento && <span className="text-red-500 text-xs">{errors.fechaVencimiento}</span>}
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Items</label>
            <button
              type="button"
              onClick={addItem}
              className="text-blue-600 hover:text-blue-800"
            >
              + Agregar Item
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="border rounded p-4 mb-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Descripción *</label>
                  <input
                    type="text"
                    value={item.descripcion}
                    onChange={(e) => handleItemChange(index, 'descripcion', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Descripción del item"
                  />
                  {errors[`item${index}_descripcion`] && (
                    <span className="text-red-500 text-xs">{errors[`item${index}_descripcion`]}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cantidad *</label>
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => handleItemChange(index, 'cantidad', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                    min="1"
                  />
                  {errors[`item${index}_cantidad`] && (
                    <span className="text-red-500 text-xs">{errors[`item${index}_cantidad`]}</span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Precio Unitario *</label>
                  <input
                    type="number"
                    value={item.precioUnitario}
                    onChange={(e) => handleItemChange(index, 'precioUnitario', parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                    min="0"
                    step="0.01"
                  />
                  {errors[`item${index}_precioUnitario`] && (
                    <span className="text-red-500 text-xs">{errors[`item${index}_precioUnitario`]}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="text-sm">
                  Monto: ${item.monto.toFixed(2)}
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="text-right mb-6">
          <div className="text-lg font-bold">
            Total: ${formData.items.reduce((sum, item) => sum + item.monto, 0).toFixed(2)}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar Factura
          </button>
        </div>
      </form>
    </div>
  );
}