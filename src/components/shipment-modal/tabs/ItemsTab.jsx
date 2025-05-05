import React from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';

const ShipmentItem = ({
    item,
    index,
    isEditing,
    canEdit,
    userRole,
    handleItemChange,
    handleRemoveItem,
    shipment
}) => {
    // Verificar que existe el item
    if (!item) return null;

    // Asegurar que los valores numéricos son números y no NaN
    const safeQuantity = Number(item.quantity) || 1;
    const safeWeight = Number(item.weight) || 0;
    const safeValue = Number(item.value) || 0;

    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 whitespace-nowrap">
                {isEditing && userRole === 'admin' && canEdit(shipment) ? (
                    <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Descripción"
                    />
                ) : (
                    <span className="text-gray-700">{item.description || 'Sin descripción'}</span>
                )}
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
                {isEditing && userRole === 'admin' && canEdit(shipment) ? (
                    <input
                        type="number"
                        value={safeQuantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="1"
                    />
                ) : (
                    <span className="text-gray-700">{safeQuantity}</span>
                )}
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
                {isEditing && userRole === 'admin' && canEdit(shipment) ? (
                    <div className="flex items-center justify-end gap-1">
                        <input
                            type="number"
                            value={safeWeight}
                            onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="0"
                            step="0.1"
                        />
                        <span className="text-gray-500">lb</span>
                    </div>
                ) : (
                    <span className="text-gray-700">{safeWeight} lb</span>
                )}
            </td>
            {userRole === 'admin' && (
                <td className="px-4 py-3 text-right whitespace-nowrap">
                    {isEditing && canEdit(shipment) ? (
                        <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-500">$</span>
                            <input
                                type="number"
                                value={safeValue}
                                onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    ) : (
                        <span className="text-gray-700">${safeValue.toFixed(2)}</span>
                    )}
                </td>
            )}
            {isEditing && userRole === 'admin' && canEdit(shipment) && (
                <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </td>
            )}
        </tr>
    );
};

const ItemsTab = ({
    editData,
    shipment,
    isEditing,
    userRole,
    canEdit,
    handleAddItem,
    handleItemChange,
    handleRemoveItem
}) => {
    // Calcular totales de todos los items
    const calculateTotals = (items) => {
        if (!items || !Array.isArray(items) || items.length === 0) return { weight: 0, value: 0 };

        return items.reduce((acc, item) => {
            const weight = parseFloat(item.weight) || 0;
            const value = parseFloat(item.value) || 0;
            const quantity = parseFloat(item.quantity) || 1;

            return {
                weight: acc.weight + (weight * quantity),
                value: acc.value + (value * quantity)
            };
        }, { weight: 0, value: 0 });
    };

    // Asegurar que items sea siempre un array
    const items = Array.isArray(editData?.items) ? editData.items : [];
    const totals = calculateTotals(items);

    // Formatear el costo correctamente
    const formatShippingCost = (cost) => {
        const numericCost = typeof cost === 'string' ? parseFloat(cost) : (typeof cost === 'number' ? cost : 0);
        return isNaN(numericCost) ? '0.00' : numericCost.toFixed(2);
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium flex items-center gap-2 text-gray-800">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span>Items del Envío</span>
                </h3>
                {isEditing && userRole === 'admin' && canEdit(shipment) && (
                    <button
                        onClick={handleAddItem}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar Item
                    </button>
                )}
            </div>

            {items.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Peso</th>
                                {userRole === 'admin' && (
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                )}
                                {isEditing && userRole === 'admin' && canEdit(shipment) && (
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item, index) => (
                                <ShipmentItem
                                    key={index}
                                    item={item}
                                    index={index}
                                    isEditing={isEditing}
                                    canEdit={canEdit}
                                    userRole={userRole}
                                    handleItemChange={handleItemChange}
                                    handleRemoveItem={handleRemoveItem}
                                    shipment={shipment}
                                />
                            ))}

                            {/* Fila de Total */}
                            <tr className="font-semibold bg-blue-50/50 border-t-2 border-blue-100">
                                <td colSpan="2" className="px-4 py-3 text-right">Peso Total:</td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <span className="font-medium">
                                        {totals.weight.toFixed(2)} lb
                                    </span>
                                </td>
                                {userRole === 'admin' && (
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <span className="font-medium text-green-600">
                                            ${formatShippingCost(totals.value)}
                                        </span>
                                    </td>
                                )}
                                {isEditing && userRole === 'admin' && canEdit(shipment) && <td></td>}
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No hay items en este envío.</p>
                    {isEditing && userRole === 'admin' && canEdit(shipment) && (
                        <button
                            onClick={handleAddItem}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Primer Item
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ItemsTab;