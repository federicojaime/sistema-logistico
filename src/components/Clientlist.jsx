import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    Eye,
    Trash2,
    Filter,
    X,
    Check,
    Building2,
    Edit,
    Save
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const TAX_CONDITIONS = [
    'Responsable Inscripto',
    'Monotributista',
    'Exento',
    'Consumidor Final',
    'No Responsable'
];

const PAYMENT_TERMS = [
    'Contado',
    '15 días',
    '30 días',
    '60 días',
    '90 días'
];

const ClientModal = ({ client, onClose, onSave }) => {
    // Modelo de datos inicial para nuevo cliente
    const initialClientData = {
        business_name: '',
        tax_id: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'Argentina',
        postal_code: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        credit_limit: 0,
        payment_terms: '',
        tax_condition: '',
        notes: '',
        status: 'active'
    };

    // Estado para datos del formulario
    const [editData, setEditData] = useState(client || initialClientData);
    
    // Estado para errores
    const [errors, setErrors] = useState({});

    // Actualizar datos cuando cambia el cliente seleccionado
    useEffect(() => {
        if (client) {
            setEditData({...initialClientData, ...client});
        } else {
            setEditData({...initialClientData});
        }
    }, [client]);

    const validateForm = () => {
        const newErrors = {};
        if (!editData.business_name?.trim()) {
            newErrors.business_name = 'La razón social es requerida';
        }
        if (!editData.tax_id?.trim()) {
            newErrors.tax_id = 'El CUIT/NIT es requerido';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            let response;
            if (client?.id) {
                response = await api.put(`/clients/${client.id}`, editData);
            } else {
                response = await api.post('/clients', editData);
            }

            // Verificamos si la respuesta existe y es exitosa
            if (response && (response.ok || response.status === 200 || response.status === 201)) {
                onSave();
            } else {
                // Si la respuesta existe pero no es exitosa
                const errorMsg = response && response.msg ? response.msg : 'Error al guardar el cliente';
                throw new Error(errorMsg);
            }
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Error al guardar el cliente. Verifique la conexión con el servidor.'
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                        {client?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Información Principal */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Razón Social *
                                </label>
                                <input
                                    type="text"
                                    value={editData.business_name || ''}
                                    onChange={(e) => setEditData(prev => ({
                                        ...prev,
                                        business_name: e.target.value
                                    }))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${errors.business_name ? 'border-red-500' : ''}`}
                                />
                                {errors.business_name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.business_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CUIT/NIT *
                                </label>
                                <input
                                    type="text"
                                    value={editData.tax_id || ''}
                                    onChange={(e) => setEditData(prev => ({
                                        ...prev,
                                        tax_id: e.target.value
                                    }))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                    ${errors.tax_id ? 'border-red-500' : ''}`}
                                />
                                {errors.tax_id && (
                                    <p className="mt-1 text-sm text-red-500">{errors.tax_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Condición Fiscal
                                </label>
                                <select
                                    value={editData.tax_condition || ''}
                                    onChange={(e) => setEditData(prev => ({
                                        ...prev,
                                        tax_condition: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccionar condición</option>
                                    {TAX_CONDITIONS.map(condition => (
                                        <option key={condition} value={condition}>
                                            {condition}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Términos de Pago
                                </label>
                                <select
                                    value={editData.payment_terms || ''}
                                    onChange={(e) => setEditData(prev => ({
                                        ...prev,
                                        payment_terms: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccionar términos</option>
                                    {PAYMENT_TERMS.map(term => (
                                        <option key={term} value={term}>
                                            {term}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Límite de Crédito
                                </label>
                                <input
                                    type="number"
                                    value={editData.credit_limit || 0}
                                    onChange={(e) => setEditData(prev => ({
                                        ...prev,
                                        credit_limit: parseFloat(e.target.value) || 0
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Contacto y Dirección */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editData.email || ''}
                                    onChange={(e) => setEditData(prev => ({
                                        ...prev,
                                        email: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={editData.phone || ''}
                                    onChange={(e) => setEditData(prev => ({
                                        ...prev,
                                        phone: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    value={editData.address || ''}
                                    onChange={(e) => setEditData(prev => ({
                                        ...prev,
                                        address: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ciudad
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.city || ''}
                                        onChange={(e) => setEditData(prev => ({
                                            ...prev,
                                            city: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Provincia
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.state || ''}
                                        onChange={(e) => setEditData(prev => ({
                                            ...prev,
                                            state: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        País
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.country || 'Argentina'}
                                        onChange={(e) => setEditData(prev => ({
                                            ...prev,
                                            country: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Código Postal
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.postal_code || ''}
                                        onChange={(e) => setEditData(prev => ({
                                            ...prev,
                                            postal_code: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Persona de Contacto */}
                        <div className="space-y-4 md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-700">Persona de Contacto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.contact_person || ''}
                                        onChange={(e) => setEditData(prev => ({
                                            ...prev,
                                            contact_person: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={editData.contact_phone || ''}
                                        onChange={(e) => setEditData(prev => ({
                                            ...prev,
                                            contact_phone: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={editData.contact_email || ''}
                                        onChange={(e) => setEditData(prev => ({
                                            ...prev,
                                            contact_email: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notas */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notas
                            </label>
                            <textarea
                                value={editData.notes || ''}
                                onChange={(e) => setEditData(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                            {errors.submit}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors 
                       flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {client?.id ? 'Guardar Cambios' : 'Crear Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export function ClientList() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('todos');
    const [modalData, setModalData] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [filteredClients, setFilteredClients] = useState([]);

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

    // Función para filtrar clientes localmente
    const filterClients = () => {
        // Asegurarse de que clients es un array
        if (!Array.isArray(clients) || clients.length === 0) {
            setFilteredClients([]);
            return;
        }

        try {
            let result = [...clients];
            
            // Aplicar filtro de búsqueda
            if (searchQuery && searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase().trim();
                result = result.filter(client => 
                    (client.business_name && client.business_name.toLowerCase().includes(query)) || 
                    (client.tax_id && client.tax_id.toLowerCase().includes(query))
                );
            }
            
            // Aplicar filtro de estado
            if (selectedStatus && selectedStatus !== 'todos') {
                result = result.filter(client => client.status === selectedStatus);
            }
            
            setFilteredClients(result);
        } catch (error) {
            console.error('Error al filtrar clientes:', error);
            setFilteredClients([]);
        }
    };

    // Efecto para cargar clientes al inicio - usando AbortController para manejar cancelaciones
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

    // Efecto para filtrar clientes cuando cambian los criterios o la lista
    useEffect(() => {
        filterClients();
    }, [searchQuery, selectedStatus, clients]);

    const handleSave = async () => {
        try {
            await loadClients();
            setModalData(null);
            setShowSuccess(true);
            setSuccessMessage('Cliente guardado correctamente');
            setTimeout(() => {
                setShowSuccess(false);
                setSuccessMessage('');
            }, 3000);
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            setError('Error al actualizar la lista de clientes.');
        }
    };

    const handleDelete = async (clientId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
            try {
                const response = await api.delete(`/clients/${clientId}`);
                if (response && (response.ok || response.status === 200 || response.status === 204)) {
                    await loadClients();
                    setShowSuccess(true);
                    setSuccessMessage('Cliente eliminado correctamente');
                    setTimeout(() => {
                        setShowSuccess(false);
                        setSuccessMessage('');
                    }, 3000);
                } else {
                    throw new Error((response && response.msg) || 'Error al eliminar el cliente');
                }
            } catch (error) {
                console.error('Error deleting client:', error);
                setError('Error al eliminar el cliente. Verifique la conexión con el servidor.');
            }
        }
    };

    if (loading && clients.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header y Controles */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Lista de Clientes</h2>

                <button
                    onClick={() => setModalData({})}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                   flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Cliente
                </button>
            </div>

            {/* Mensajes de éxito y error */}
            {showSuccess && (
                <Alert className="mb-4 bg-green-50 border-green-500">
                    <Check className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert className="mb-4 bg-red-50 border-red-500">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
            )}

            {/* Filtros */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o CUIT..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400 w-5 h-5" />
                    <select
                        className="flex-1 py-2 px-3 rounded-lg border border-gray-300 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Lista de Clientes */}
            {filteredClients.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="mb-4">
                        <Building2 className="h-16 w-16 mx-auto text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        No hay clientes para mostrar
                    </h3>
                    <p className="text-gray-500">
                        No se encontraron clientes con los filtros seleccionados.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Razón Social
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        CUIT/NIT
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Teléfono
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">
                                                {client.business_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {client.tax_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {client.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {client.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${client.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'}`}
                                            >
                                                {client.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => setModalData(client)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>

                                                <button
                                                    onClick={() => setModalData(client)}
                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(client.id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
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