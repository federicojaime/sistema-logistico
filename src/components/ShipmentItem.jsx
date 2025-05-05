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
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 whitespace-nowrap">
                {isEditing && userRole === 'admin' && canEdit(shipment) ? (
                    <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                ) : (
                    <span className="text-gray-700">{item.description}</span>
                )}
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
                {isEditing && userRole === 'admin' && canEdit(shipment) ? (
                    <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="1"
                    />
                ) : (
                    <span className="text-gray-700">{item.quantity}</span>
                )}
            </td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
                {isEditing && userRole === 'admin' && canEdit(shipment) ? (
                    <div className="flex items-center justify-end gap-1">
                        <input
                            type="number"
                            value={item.weight}
                            onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="0"
                            step="0.1"
                        />
                        <span className="text-gray-500">lb</span>
                    </div>
                ) : (
                    <span className="text-gray-700">{item.weight} lb</span>
                )}
            </td>
            {userRole === 'admin' && (
                <td className="px-4 py-3 text-right whitespace-nowrap">
                    {isEditing && canEdit(shipment) ? (
                        <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-500">$</span>
                            <input
                                type="number"
                                value={item.value}
                                onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    ) : (
                        <span className="text-gray-700">${item.value}</span>
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

export default ShipmentItem;