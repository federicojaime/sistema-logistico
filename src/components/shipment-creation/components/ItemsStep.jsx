// src/components/shipment-creation/components/ItemsStep.jsx
import React, { useState } from 'react';
import { Plus, Trash2, Package, Check, X } from 'lucide-react';
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

    // Función para manejar cambios en los servicios directamente desde esta pantalla
    const handleServiceChange = (service, value) => {
        setShipment(prev => ({
            ...prev,
            [service]: value
        }));

        // Limpiar el error de items si existía y ahora hay servicios seleccionados
        if (errors.items) {
            const hasServiceItems =
                (service === 'liftGate' && value === 'YES') ||
                (service !== 'liftGate' && shipment.liftGate === 'YES') ||
                (service === 'appointment' && value === 'YES') ||
                (service !== 'appointment' && shipment.appointment === 'YES') ||
                (service === 'palletJack' && value === 'YES') ||
                (service !== 'palletJack' && shipment.palletJack === 'YES');

            if (hasServiceItems) {
                setErrors(prev => ({ ...prev, items: undefined }));
            }
        }
    };

    // Función para manejar cambios en los precios de los servicios
    const handleServicePriceChange = (service, price) => {
        setShipment(prev => ({
            ...prev,
            servicePrices: {
                ...prev.servicePrices,
                [service]: parseFloat(price) || 0
            }
        }));
    };

    // Crear array de ítems de servicios basados en los servicios seleccionados
    const getServiceItems = () => {
        const serviceItems = [];

        // Agregar Lift Gate si está activo
        if (shipment.liftGate === 'YES') {
            serviceItems.push({
                id: 'service-liftGate',
                descripcion: 'Servicio: Lift Gate',
                cantidad: 1,
                pesoTotal: 0,
                valorTotal: parseFloat(shipment.servicePrices.liftGate) || 0,
                isService: true,
                serviceType: 'liftGate'
            });
        }

        // Agregar Appointment si está activo
        if (shipment.appointment === 'YES') {
            serviceItems.push({
                id: 'service-appointment',
                descripcion: 'Servicio: Appointment',
                cantidad: 1,
                pesoTotal: 0,
                valorTotal: parseFloat(shipment.servicePrices.appointment) || 0,
                isService: true,
                serviceType: 'appointment'
            });
        }

        // Agregar Pallet Jack si está activo
        if (shipment.palletJack === 'YES') {
            serviceItems.push({
                id: 'service-palletJack',
                descripcion: 'Servicio: Pallet Jack',
                cantidad: 1,
                pesoTotal: 0,
                valorTotal: parseFloat(shipment.servicePrices.palletJack) || 0,
                isService: true,
                serviceType: 'palletJack'
            });
        }

        return serviceItems;
    };

    const serviceItems = getServiceItems();

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

        const itemToAdd = { ...newItem, id: `item-${Date.now()}` };

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

    // Calcular totales - CORREGIDO: el peso NO se multiplica por cantidad
    const calculateTotals = () => {
        // Combinar ítems regulares y de servicios
        const allItems = [...shipment.items, ...serviceItems];

        return allItems.reduce(
            (acc, item) => ({
                cantidad: acc.cantidad + parseInt(item.cantidad || 1),
                // El peso NO se multiplica por cantidad porque pesoTotal ya es el peso total del ítem
                peso: acc.peso + parseFloat(item.pesoTotal || 0),
                // El valor SÍ se multiplica por cantidad
                valor: acc.valor + (parseFloat(item.valorTotal || 0) * parseInt(item.cantidad || 1)),
            }),
            { cantidad: 0, peso: 0, valor: 0 }
        );
    };

    const totals = calculateTotals();

    // Todos los items combinados (regulares + servicios)
    const allItems = [...shipment.items, ...serviceItems];

    // Verificar si hay ítems válidos (regulares o servicios)
    const hasValidItems = shipment.items.length > 0 || serviceItems.length > 0;

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
                                placeholder="Peso total del ítem"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Ingrese el peso total del ítem (no se multiplicará por cantidad)
                            </p>
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

                {/* Servicios adicionales */}
                <div className="mb-6 border-t pt-6">
                    <h3 className="font-medium text-gray-800 mb-4">Servicios Adicionales</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Los servicios seleccionados se agregarán automáticamente como ítems del envío.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Lift Gate */}
                        <div className={`p-4 rounded-xl border ${shipment.liftGate === 'YES' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <label className={`text-sm font-medium ${shipment.liftGate === 'YES' ? 'text-blue-800' : 'text-gray-800'}`}>Lift Gate</label>
                                <div className="flex space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => handleServiceChange('liftGate', 'YES')}
                                        className={`px-3 py-1 text-xs rounded-l-lg border border-r-0 ${shipment.liftGate === 'YES'
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span className="flex items-center">
                                            {shipment.liftGate === 'YES' && <Check className="w-3 h-3 mr-1" />}
                                            SÍ
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleServiceChange('liftGate', 'NO')}
                                        className={`px-3 py-1 text-xs rounded-r-lg border ${shipment.liftGate === 'NO'
                                                ? 'bg-gray-500 text-white border-gray-500'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span className="flex items-center">
                                            {shipment.liftGate === 'NO' && <X className="w-3 h-3 mr-1" />}
                                            NO
                                        </span>
                                    </button>
                                </div>
                            </div>
                            {shipment.liftGate === 'YES' && (
                                <div className="flex items-center mt-2">
                                    <span className="text-sm text-blue-700 mr-2">Precio:</span>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">$</span>
                                        <input
                                            type="number"
                                            value={shipment.servicePrices.liftGate}
                                            onChange={(e) => handleServicePriceChange('liftGate', e.target.value)}
                                            className="w-full pl-8 py-1.5 border border-blue-300 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Appointment */}
                        <div className={`p-4 rounded-xl border ${shipment.appointment === 'YES' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <label className={`text-sm font-medium ${shipment.appointment === 'YES' ? 'text-blue-800' : 'text-gray-800'}`}>Appointment</label>
                                <div className="flex space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => handleServiceChange('appointment', 'YES')}
                                        className={`px-3 py-1 text-xs rounded-l-lg border border-r-0 ${shipment.appointment === 'YES'
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span className="flex items-center">
                                            {shipment.appointment === 'YES' && <Check className="w-3 h-3 mr-1" />}
                                            SÍ
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleServiceChange('appointment', 'NO')}
                                        className={`px-3 py-1 text-xs rounded-r-lg border ${shipment.appointment === 'NO'
                                                ? 'bg-gray-500 text-white border-gray-500'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span className="flex items-center">
                                            {shipment.appointment === 'NO' && <X className="w-3 h-3 mr-1" />}
                                            NO
                                        </span>
                                    </button>
                                </div>
                            </div>
                            {shipment.appointment === 'YES' && (
                                <div className="flex items-center mt-2">
                                    <span className="text-sm text-blue-700 mr-2">Precio:</span>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">$</span>
                                        <input
                                            type="number"
                                            value={shipment.servicePrices.appointment}
                                            onChange={(e) => handleServicePriceChange('appointment', e.target.value)}
                                            className="w-full pl-8 py-1.5 border border-blue-300 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pallet Jack */}
                        <div className={`p-4 rounded-xl border ${shipment.palletJack === 'YES' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <label className={`text-sm font-medium ${shipment.palletJack === 'YES' ? 'text-blue-800' : 'text-gray-800'}`}>Pallet Jack</label>
                                <div className="flex space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => handleServiceChange('palletJack', 'YES')}
                                        className={`px-3 py-1 text-xs rounded-l-lg border border-r-0 ${shipment.palletJack === 'YES'
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span className="flex items-center">
                                            {shipment.palletJack === 'YES' && <Check className="w-3 h-3 mr-1" />}
                                            SÍ
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleServiceChange('palletJack', 'NO')}
                                        className={`px-3 py-1 text-xs rounded-r-lg border ${shipment.palletJack === 'NO'
                                                ? 'bg-gray-500 text-white border-gray-500'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span className="flex items-center">
                                            {shipment.palletJack === 'NO' && <X className="w-3 h-3 mr-1" />}
                                            NO
                                        </span>
                                    </button>
                                </div>
                            </div>
                            {shipment.palletJack === 'YES' && (
                                <div className="flex items-center mt-2">
                                    <span className="text-sm text-blue-700 mr-2">Precio:</span>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">$</span>
                                        <input
                                            type="number"
                                            value={shipment.servicePrices.palletJack}
                                            onChange={(e) => handleServicePriceChange('palletJack', e.target.value)}
                                            className="w-full pl-8 py-1.5 border border-blue-300 bg-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            )}
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

                    {allItems.length === 0 ? (
                        <div className="text-center py-8 border border-dashed rounded-xl bg-gray-50">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No hay items agregados al envío</p>
                            <p className="text-sm text-gray-400 mt-1">Agrega un item o selecciona servicios adicionales</p>
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
                                            Peso Total (lb)
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
                                    {/* Ítems regulares */}
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
                                                    title="Eliminar item"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Ítems de servicios */}
                                    {serviceItems.map((item) => (
                                        <tr key={item.id} className="bg-blue-50 hover:bg-blue-100 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-700">
                                                {item.descripcion}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 text-right">
                                                {item.cantidad}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 text-right">
                                                {parseFloat(item.pesoTotal).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 text-right">
                                                ${parseFloat(item.valorTotal).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <span className="text-blue-400 italic text-xs">
                                                    Servicio
                                                </span>
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