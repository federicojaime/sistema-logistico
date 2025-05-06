// src/components/UserTable.jsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const UserTable = ({
    currentItems,
    handleEdit,
    handleDelete,
    loading,
    searchQuery,
    getRoleLabel,
    getRoleClasses
}) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Email
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                            Nombre
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Rol
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                        currentItems.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm">{user.email}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">
                                    {`${user.firstname} ${user.lastname}`}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={`px-1.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClasses(user.role)}`}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center space-x-1">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded-full hover:bg-indigo-50"
                                            disabled={loading}
                                            title="Editar"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                                            disabled={loading}
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="px-3 py-8 text-center text-gray-500">
                                {searchQuery
                                    ? `No se encontraron usuarios que coincidan con "${searchQuery}"`
                                    : "No hay usuarios registrados"}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;