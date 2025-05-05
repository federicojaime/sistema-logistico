// src/components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { authService } from '../services/authService';

export function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        role: 'transportista'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await authService.getUsers();
            if (response.ok) {
                // Filtrar para excluir el usuario con ID 99999 (Sin Transportista)
                const filteredUsers = response.data.filter(user => user.id !== 99999);
                setUsers(filteredUsers);
            } else {
                setError('Error al cargar usuarios');
            }
        } catch (err) {
            setError('Error al cargar usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            let response;
            if (editingUser) {
                response = await authService.updateUser(editingUser.id, formData);
            } else {
                response = await authService.createUser(formData);
            }

            if (response.ok) {
                setSuccess(editingUser ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito');
                setShowForm(false);
                setEditingUser(null);
                loadUsers();
                setFormData({
                    email: '',
                    password: '',
                    firstname: '',
                    lastname: '',
                    role: 'transportista'
                });
            } else {
                setError(response.msg || 'Error en la operación');
            }
        } catch (err) {
            setError('Error en la operación');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            role: user.role,
            password: '' // La contraseña no se carga por seguridad
        });
        setShowForm(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                setLoading(true);
                const response = await authService.deleteUser(userId);
                if (response.ok) {
                    setSuccess('Usuario eliminado con éxito');
                    loadUsers();
                } else {
                    setError(response.msg || 'Error al eliminar usuario');
                }
            } catch (err) {
                setError('Error al eliminar usuario');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    // Función para obtener la etiqueta del rol
    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return 'Administrativo';
            case 'contable':
                return 'Contable';
            case 'transportista':
                return 'Transportista';
            default:
                return role;
        }
    };

    // Función para obtener las clases de estilo según el rol
    const getRoleClasses = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'contable':
                return 'bg-blue-100 text-blue-800';
            case 'transportista':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-4 px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
                    <button
                        onClick={() => {
                            setShowForm(true);
                            setEditingUser(null);
                            setFormData({
                                email: '',
                                password: '',
                                firstname: '',
                                lastname: '',
                                role: 'transportista'
                            });
                        }}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center sm:justify-start gap-1.5 text-sm w-full sm:w-auto"
                        disabled={loading}
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Usuario
                    </button>
                </div>

                {error && (
                    <Alert className="mb-4 bg-red-50 border-red-500">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-red-700">{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-4 bg-green-50 border-green-500">
                        <Check className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700">{success}</AlertDescription>
                    </Alert>
                )}

                {showForm && (
                    <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold mb-3">
                            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={editingUser}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required={!editingUser}
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstname}
                                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellido
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastname}
                                        onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rol
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="transportista">Transportista</option>
                                        <option value="contable">Contable</option>
                                        <option value="admin">Administrativo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingUser(null);
                                    }}
                                    className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : (editingUser ? 'Guardar Cambios' : 'Crear Usuario')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
                            {users.map((user) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200 mt-4">
                        No hay usuarios registrados
                    </div>
                )}
            </div>
        </div>
    );
}