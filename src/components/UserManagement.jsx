// src/components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
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

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await authService.getUsers();
            if (response.ok) {
                setUsers(response.data);
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
        return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h2>
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
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        disabled={loading}
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Usuario
                    </button>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="mb-4 bg-green-50 text-green-700 border-green-500">
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {showForm && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">
                            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
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
                                        className="w-full p-2 border rounded-lg"
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
                                        className="w-full p-2 border rounded-lg"
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
                                        className="w-full p-2 border rounded-lg"
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
                                        className="w-full p-2 border rounded-lg"
                                        required
                                    >
                                        <option value="transportista">Transportista</option>
                                        <option value="contable">Contable</option>
                                        <option value="admin">Administrativo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingUser(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Guardando...' : (editingUser ? 'Guardar Cambios' : 'Crear Usuario')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {`${user.firstname} ${user.lastname}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClasses(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            disabled={loading}
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                            disabled={loading}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && !loading && (
                    <div className="text-center py-8 text-gray-500">
                        No hay usuarios registrados
                    </div>
                )}
            </div>
        </div>
    );
}