import React from 'react';
import { Trash2 } from 'lucide-react';

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
    // Verificar que existe el item y tiene propiedades válidas
    if (!item) return null;
    
    // Asegurar valores numéricos seguros
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
                        placeholder="Descripción del ítem"
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
                        title="Eliminar ítem"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </td>
            )}
        </tr>
    );
};

export default ShipmentItem;