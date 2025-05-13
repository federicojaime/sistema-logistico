// src/components/SubClientList.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Users, Search, ArrowLeft, MoreVertical, Edit, Trash, RefreshCw } from 'lucide-react';
import api from '../services/api';
import SubClientModal from './SubClientModal';

const SubClientList = ({ clientId, clientName, onBack }) => {
    const [subClients, setSubClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedSubClient, setSelectedSubClient] = useState(null);
    const [showDropdownId, setShowDropdownId] = useState(null);

    // Cargar la lista de sub clientes
    const loadSubClients = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/clients/${clientId}/subclients`);
            if (response && response.data) {
                setSubClients(Array.isArray(response.data) ? response.data : []);
            } else {
                setSubClients([]);
            }
            setError(null);
        } catch (err) {
            console.error('Error al cargar sub clientes:', err);
            setError('No se pudieron cargar los sub clientes. Por favor, intente nuevamente.');
            setSubClients([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubClients();
    }, [clientId]);

    // Filtrar sub clientes basados en la búsqueda
    const filteredSubClients = subClients.filter(subClient =>
        subClient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subClient.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subClient.tax_id?.includes(searchQuery) ||
        subClient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subClient.phone?.includes(searchQuery)
    );

    // Manejar eliminación de sub cliente
    const handleDeleteSubClient = async (subClientId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este sub cliente?')) {
            try {
                setLoading(true);
                const response = await api.delete(`/clients/${clientId}/subclients/${subClientId}`);
                if (response) {
                    // Recargar la lista después de eliminar
                    loadSubClients();
                }
            } catch (err) {
                console.error('Error al eliminar sub cliente:', err);
                setError('Error al eliminar sub cliente. Por favor, intente nuevamente.');
            } finally {
                setLoading(false);
                setShowDropdownId(null); // Cerrar el dropdown
            }
        }
    };

    // Abrir modal para editar
    const handleEditSubClient = (subClient) => {
        setSelectedSubClient(subClient);
        setShowModal(true);
        setShowDropdownId(null); // Cerrar el dropdown
    };

    // Abrir modal para crear
    const handleAddSubClient = () => {
        setSelectedSubClient(null);
        setShowModal(true);
    };

    // Manejar la actualización después de cerrar el modal
    const handleModalClose = (shouldRefresh) => {
        if (shouldRefresh) {
            loadSubClients();
        }
        setShowModal(false);
        setSelectedSubClient(null);
    };

    // Toggle dropdown menu
    const toggleDropdown = (id) => {
        if (showDropdownId === id) {
            setShowDropdownId(null);
        } else {
            setShowDropdownId(id);
        }
    };

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdownId && !event.target.closest('.dropdown-menu')) {
                setShowDropdownId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdownId]);

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Barra superior */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a Clientes
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">
                        Sub Clientes de {clientName}
                    </h1>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Buscar sub cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadSubClients}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            title="Actualizar"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleAddSubClient}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Sub Cliente
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando sub clientes...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={loadSubClients}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : filteredSubClients.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            {searchQuery ? 'No se encontraron resultados' : 'No hay sub clientes'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchQuery
                                ? `No hay sub clientes que coincidan con "${searchQuery}"`
                                : `No hay sub clientes asociados a ${clientName}. Crea uno nuevo para empezar.`}
                        </p>
                        <button
                            onClick={handleAddSubClient}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <Plus className="w-5 h-5" />
                            Agregar Sub Cliente
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        CUIT/NIT
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contacto
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSubClients.map((subClient) => (
                                    <tr key={subClient.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Users className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {subClient.business_name || subClient.name || 'Sin nombre'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {subClient.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {subClient.tax_id || 'No especificado'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {subClient.email || 'Sin correo'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {subClient.phone || 'Sin teléfono'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                            <button
                                                onClick={() => toggleDropdown(subClient.id)}
                                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {showDropdownId === subClient.id && (
                                                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                                    <button
                                                        onClick={() => handleEditSubClient(subClient)}
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSubClient(subClient.id)}
                                                        className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left flex items-center"
                                                    >
                                                        <Trash className="w-4 h-4 mr-2" />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal para crear/editar sub cliente */}
            {showModal && (
                <SubClientModal
                    clientId={clientId}
                    subClient={selectedSubClient}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
};

export default SubClientList;