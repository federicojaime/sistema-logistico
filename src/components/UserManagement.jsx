// src/components/UserManagement.jsx (actualizado)
import React, { useState, useEffect } from 'react';
import { Plus, Check, AlertCircle, Users } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { authService } from '../services/authService';

// Componentes
import UserFormModal from './UserFormModal';
import UserTable from './UserTable';
import UserPagination from './UserPagination';
import UserSearch from './UserSearch';

export function UserManagement() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstname: '',
        lastname: '',
        role: 'transportista'
    });

    // Estados para búsqueda y paginación
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});
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

    // Filtrar usuarios cuando cambia la búsqueda
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = users.filter(user =>
                user.email.toLowerCase().includes(query) ||
                user.firstname.toLowerCase().includes(query) ||
                user.lastname.toLowerCase().includes(query) ||
                `${user.firstname} ${user.lastname}`.toLowerCase().includes(query) ||
                user.role.toLowerCase().includes(query)
            );
            setFilteredUsers(filtered);
        }
        setCurrentPage(1); // Volver a la primera página al filtrar
    }, [searchQuery, users]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await authService.getUsers();
            if (response.ok) {
                // Filtrar para excluir el usuario con ID 99999 (Sin Transportista)
                const filteredUsers = response.data.filter(user => user.id !== 99999);
                setUsers(filteredUsers);
                setFilteredUsers(filteredUsers);
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
        setFormErrors({});
        setSuccess('');
        setLoading(true);

        try {
            let response;
            if (editingUser) {
                response = await authService.updateUser(editingUser.id, formData);
            } else {
                response = await authService.createUser(formData);
            }

            if (response && response.ok) {
                setSuccess(editingUser ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito');
                setShowModal(false);
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
                // Manejar errores
                if (response && response.errores) {
                    // Obtener los mensajes de error tal como vienen
                    const errorMessage = Object.entries(response.errores)
                        .map(([field, messages]) => {
                            if (Array.isArray(messages)) {
                                return messages.join('. ');
                            }
                            return messages;
                        })
                        .join('. ');

                    // No procesar, solo pasar directamente el mensaje
                    setFormErrors(errorMessage);
                } else if (response && response.msg) {
                    setFormErrors(response.msg);
                } else {
                    setFormErrors('Error en la operación');
                }
            }
        } catch (err) {
            console.error('Error en la operación:', err);

            if (err && err.errores) {
                const errorMessage = Object.entries(err.errores)
                    .map(([field, messages]) => {
                        if (Array.isArray(messages)) {
                            return messages.join('. ');
                        }
                        return messages;
                    })
                    .join('. ');

                setFormErrors(errorMessage);
            } else if (err && err.msg) {
                setFormErrors(err.msg);
            } else {
                setFormErrors('Error en la operación');
            }
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
        setShowModal(true);
        // Limpiar los errores al abrir el modal para editar
        setFormErrors({});
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

    // Limpiar búsqueda
    const clearSearch = () => {
        setSearchQuery('');
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

    // Calcular paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        Gestión de Usuarios
                    </h2>
                    <button
                        onClick={() => {
                            setShowModal(true);
                            setEditingUser(null);
                            setFormErrors({});
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

                <UserSearch
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    clearSearch={clearSearch}
                />

                {/* Información de resultados y paginación */}
                {filteredUsers.length > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 text-sm text-gray-600">
                        <div>
                            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredUsers.length)} de {filteredUsers.length} usuarios
                        </div>
                        {searchQuery && (
                            <div className="mt-2 sm:mt-0">
                                {filteredUsers.length} resultados para "{searchQuery}"
                            </div>
                        )}
                    </div>
                )}

                <UserTable
                    currentItems={currentItems}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    loading={loading}
                    searchQuery={searchQuery}
                    getRoleLabel={getRoleLabel}
                    getRoleClasses={getRoleClasses}
                />

                <UserPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                />

                {/* Mensaje si no hay usuarios */}
                {filteredUsers.length === 0 && !loading && !searchQuery && (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200 mt-4">
                        No hay usuarios registrados
                    </div>
                )}
            </div>

            {/* Modal para crear/editar usuario */}
            <UserFormModal
                showModal={showModal}
                setShowModal={setShowModal}
                editingUser={editingUser}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                loading={loading}
                errors={formErrors}
                setFormErrors={setFormErrors} // Pasamos el setter para los errores
            />
        </div>
    );
}

export default UserManagement;