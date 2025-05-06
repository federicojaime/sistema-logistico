// src/components/shipment-creation/components/ItemsStep.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import DescriptionAutocomplete from '../../DescriptionAutocomplete';

const INITIAL_ITEM = {
    descripcion: '',
    cantidad: 1,
    pesoTotal: 0,
    valorTotal: 15,
};

const ItemsStep = ({ shipment, setShipment, errors, setErrors }) => {
    const [newItem, setNewItem] = useState(INITIAL_ITEM);
    const [itemError, setItemError] = useState('');

    const handleItemChange = (field, value) => {
        setNewItem(prev => ({
            ...prev,
            [field]: field === 'descripcion' ? value : (parseFloat(value) || 0)
        }));
    };

    const validateItem = () => {
        if (!newItem.descripcion.trim()) return 'La descripción es requerida';
        if (newItem.cantidad < 1) return 'La cantidad debe ser mayor a 0';
        //if (newItem.pesoTotal <= 0) return 'El peso total debe ser mayor a 0';
        if (newItem.valorTotal < 0) return 'El valor total no puede ser negativo';
        return '';
    };

    const handleAddItem = () => {
        const validationError = validateItem();
        if (validationError) {
            setItemError(validationError);
            return;
        }

        const itemToAdd = { ...newItem, id: Date.now() };

        setShipment(prev => ({
            ...prev,
            items: [...prev.items, itemToAdd]
        }));

        // Limpiar el error de items si existía
        if (errors.items) {
            setErrors(prev => ({ ...prev, items: undefined }));
        }

        setNewItem(INITIAL_ITEM);
        setItemError('');
    };

    const handleRemoveItem = (itemId) => {
        setShipment(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }));
    };

    // Calcular totales
    const calculateTotals = () => {
        return shipment.items.reduce((acc, item) => ({
            cantidad: acc.cantidad + item.cantidad,
            peso: acc.peso + (parseFloat(item.pesoTotal) * parseFloat(item.cantidad)),
            valor: acc.valor + (parseFloat(item.valorTotal) * parseFloat(item.cantidad)),
        }), { cantidad: 0, peso: 0, valor: 0 });
    };

    const totals = calculateTotals();

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Items del Envío</h2>
                <p className="text-sm text-gray-600">Agrega los artículos que se incluirán en este envío.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                {/* Formulario para agregar nuevo item */}
                <div className="space-y-4 mb-6">
                    <h3 className="font-medium text-gray-800">Agregar Item</h3>

                    {itemError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {itemError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Descripción *
                            </label>
                            <DescriptionAutocomplete
                                value={newItem.descripcion}
                                onChange={(value) => handleItemChange('descripcion', value)}
                                placeholder="Selecciona o ingresa descripción"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cantidad *
                            </label>
                            <input
                                type="number"
                                value={newItem.cantidad}
                                onChange={(e) => handleItemChange('cantidad', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Peso Total (lb) *
                            </label>
                            <input
                                type="number"
                                value={newItem.pesoTotal}
                                onChange={(e) => handleItemChange('pesoTotal', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Valor Total ($) *
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    value={newItem.valorTotal}
                                    onChange={(e) => handleItemChange('valorTotal', e.target.value)}
                                    className="w-full px-4 py-3 rounded-l-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="0.01"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="px-4 py-3 bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de items */}
                <div className="border-t pt-6">
                    <h3 className="font-medium text-gray-800 mb-4">Items Agregados</h3>

                    {errors.items && (
                        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {errors.items}
                        </div>
                    )}

                    {shipment.items.length === 0 ? (
                        <div className="text-center py-8 border border-dashed rounded-xl bg-gray-50">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No hay items agregados al envío</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Descripción
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cantidad
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Peso (lb)
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Valor ($)
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {shipment.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.descripcion}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {item.cantidad}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {parseFloat(item.pesoTotal).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                ${parseFloat(item.valorTotal).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Fila de totales */}
                                    <tr className="bg-gray-50 font-medium">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            Totales
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {totals.cantidad}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            {totals.peso.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                            ${totals.valor.toFixed(2)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemsStep;