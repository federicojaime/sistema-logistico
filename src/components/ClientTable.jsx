// ClientTable.jsx
import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

const ClientTable = ({ clients, onView, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full table-fixed divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">
                                Razón Social
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">
                                CUIT/NIT
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/5">
                                Email
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">
                                Teléfono
                            </th>
                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase w-1/12">
                                Estado
                            </th>
                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase w-1/8">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map((client) => (
                            <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2 truncate">
                                    <span className="text-sm font-medium text-gray-900">
                                        {client.business_name}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500 truncate">
                                    {client.tax_id}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500 truncate">
                                    {client.email}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-500 truncate">
                                    {client.phone}
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                    ${client.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'}`}
                                    >
                                        {client.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <div className="flex justify-center items-center space-x-2">
                                        <button
                                            onClick={() => onView(client)}
                                            className="text-gray-500 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                                            title="Ver detalles"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => onEdit(client)}
                                            className="text-gray-500 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>

                                        <button
                                            onClick={() => onDelete(client.id)}
                                            className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientTable;