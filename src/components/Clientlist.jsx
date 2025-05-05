// ClientList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import api from '../services/api';

// Componentes modulares
import ClientListHeader from './ClientListHeader';
import ClientListFilters from './ClientListFilters';
import ClientTable from './ClientTable';
import ClientEmptyState from './ClientEmptyState';
import ClientPagination from './ClientPagination';
import ClientModal from './ClientModal'; // Asumiendo que este componente ya existe

export function ClientList() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estado para datos
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Estado para filtros
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('todos');

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Cargar clientes
    const loadClients = async () => {
        try {
            setLoading(true);
            // Corregimos para que busque en el endpoint correcto
            const response = await api.get('/clients');

            if (response && response.data) {
                setClients(Array.isArray(response.data) ? response.data : []);
            } else {
                setClients([]);
                // No lanzamos error si el servidor devuelve lista vacía
                console.log('No se encontraron clientes o el formato de respuesta es incorrecto');
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            setError('Error al cargar la lista de clientes. Por favor, intente nuevamente.');
            setClients([]); // Aseguramos que clientes sea un array vacío en caso de error
        } finally {
            setLoading(false);
        }
    };

    // Cargar clientes al iniciar
    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                await loadClients();
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error cargando clientes:', error);
                }
            }
        };

        fetchData();

        // Función de limpieza
        return () => {
            controller.abort();
        };
    }, []);

    // Efectos para limpiar mensajes después de un tiempo
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Manejar paginación
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedStatus]);

    // Manejar guardado de cliente
    const handleSave = async () => {
        try {
            await loadClients();
            setModalData(null);
            setSuccessMessage('Cliente guardado correctamente');
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            setError('Error al actualizar la lista de clientes.');
        }
    };

    // Manejar eliminación de cliente
    const handleDelete = async (clientId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
            try {
                const response = await api.delete(`/clients/${clientId}`);
                if (response && (response.ok || response.status === 200 || response.status === 204)) {
                    await loadClients();
                    setSuccessMessage('Cliente eliminado correctamente');
                } else {
                    throw new Error((response && response.msg) || 'Error al eliminar el cliente');
                }
            } catch (error) {
                console.error('Error deleting client:', error);
                setError('Error al eliminar el cliente. Verifique la conexión con el servidor.');
            }
        }
    };

    // Filtrar clientes
    const filteredClients = useMemo(() => {
        // Asegurarse de que clients es un array
        if (!Array.isArray(clients) || clients.length === 0) {
            return [];
        }

        return clients.filter(client => {
            // Filtro de búsqueda
            const matchesSearch =
                searchQuery === '' ||
                (client.business_name && client.business_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (client.tax_id && client.tax_id.toLowerCase().includes(searchQuery.toLowerCase()));

            // Filtro de estado
            const matchesStatus =
                selectedStatus === 'todos' ||
                client.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [clients, searchQuery, selectedStatus]);

    // Calcular paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    // Mostrar spinner durante la carga inicial
    if (loading && clients.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            {/* Cabecera */}
            <ClientListHeader onCreateClient={() => setModalData({})} />

            {/* Mensajes de éxito y error */}
            {successMessage && (
                <Alert className="mb-4 bg-green-50 border-green-500">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert className="mb-4 bg-red-50 border-red-500">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
            )}

            {/* Contenedor de filtros */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <ClientListFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                />
            </div>

            {/* Lista de Clientes */}
            {filteredClients.length === 0 ? (
                <ClientEmptyState />
            ) : (
                <>
                    <ClientTable
                        clients={currentItems}
                        onView={(client) => setModalData(client)}
                        onEdit={(client) => setModalData(client)}
                        onDelete={handleDelete}
                    />

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <ClientPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={paginate}
                        />
                    )}
                </>
            )}

            {/* Modal de Cliente */}
            {modalData && (
                <ClientModal
                    client={modalData.id ? modalData : null}
                    onClose={() => setModalData(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

export default ClientList;