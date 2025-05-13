// src/components/shipment-creation/components/ClientSelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, X, Users, Edit } from 'lucide-react';
import api from '../../../services/api';
import { clientsService } from '../../../services/clientsService';

const ClientSelector = ({ shipment, handleChange, handleSelectClient, handleSelectSubClient, errors }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [clients, setClients] = useState([]);
    const [subClients, setSubClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingSubClients, setLoadingSubClients] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showSubClientResults, setShowSubClientResults] = useState(false);
    const [subClientSearchQuery, setSubClientSearchQuery] = useState('');
    const [useCustomSubClient, setUseCustomSubClient] = useState(false);
    const [showNewClientForm, setShowNewClientForm] = useState(false);
    const [showNewSubClientForm, setShowNewSubClientForm] = useState(false);
    const [newClientData, setNewClientData] = useState({ business_name: '', tax_id: '' });
    const [newSubClientData, setNewSubClientData] = useState({ business_name: '', tax_id: '' });
    const wrapperRef = useRef(null);
    const subClientWrapperRef = useRef(null);

    // Inicializar la consulta con el valor actual si existe
    useEffect(() => {
        if (shipment.cliente) {
            setSearchQuery(shipment.cliente);
        }
        if (shipment.subCliente) {
            setSubClientSearchQuery(shipment.subCliente);
            // Si el subCliente existe pero no hay subClientId, considerarlo como texto libre
            if (shipment.subCliente && !shipment.subClientId) {
                setUseCustomSubClient(true);
            }
        }
    }, [shipment.cliente, shipment.subCliente, shipment.subClientId]);

    // Cargar clientes basados en la consulta
    useEffect(() => {
        const fetchClients = async () => {
            if (!searchQuery.trim() || searchQuery.length < 2) {
                setClients([]);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/clients?search=${encodeURIComponent(searchQuery)}`);
                if (response && response.data) {
                    setClients(Array.isArray(response.data) ? response.data : []);
                } else {
                    setClients([]);
                }
            } catch (error) {
                console.error('Error al buscar clientes:', error);
                setClients([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchClients, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Cargar sub clientes cuando se selecciona un cliente principal
    useEffect(() => {
        const fetchSubClients = async () => {
            if (!shipment.clientId) {
                setSubClients([]);
                return;
            }

            setLoadingSubClients(true);
            try {
                console.log(`Cargando subclientes para el cliente ID: ${shipment.clientId}`);
                const response = await api.get(`/clients/${shipment.clientId}/subclients`);
                console.log('Respuesta de subclientes:', response);
                
                if (response && response.data) {
                    setSubClients(Array.isArray(response.data) ? response.data : []);
                } else {
                    setSubClients([]);
                }
            } catch (error) {
                console.error('Error al cargar sub clientes:', error);
                setSubClients([]);
            } finally {
                setLoadingSubClients(false);
            }
        };

        if (!useCustomSubClient && shipment.clientId) {
            fetchSubClients();
        }
    }, [shipment.clientId, useCustomSubClient]);

    // Función para crear un nuevo cliente
    const handleCreateClient = async () => {
        try {
            if (!newClientData.business_name) {
                alert('El nombre del cliente es requerido');
                return;
            }
            
            console.log('Enviando datos para crear cliente:', newClientData);
            const response = await api.post('/client', newClientData);
            console.log('Respuesta de crear cliente:', response);
            
            if (response && response.ok && response.data) {
                // Seleccionar el cliente recién creado
                handleSelectClient(response.data);
                setShowNewClientForm(false);
                setNewClientData({ business_name: '', tax_id: '' });
                setShowResults(false);
            } else {
                alert(response?.msg || 'Error al crear el cliente');
            }
        } catch (error) {
            console.error('Error detallado al crear cliente:', error);
            alert(`Error al crear el cliente: ${error.message || 'Error desconocido'}`);
        }
    };

    // Función para crear un nuevo subcliente
    const handleCreateSubClient = async () => {
        try {
            if (!newSubClientData.business_name) {
                alert('El nombre del subcliente es requerido');
                return;
            }
            
            if (!shipment.clientId) {
                alert('Debe seleccionar un cliente principal primero');
                return;
            }
            
            console.log('Enviando datos para crear subcliente:', {
                clientId: shipment.clientId,
                data: newSubClientData
            });
            
            const response = await api.post(`/clients/${shipment.clientId}/subclient`, newSubClientData);
            console.log('Respuesta de crear subcliente:', response);
            
            if (response && response.ok && response.data) {
                // Seleccionar el subcliente recién creado
                handleSelectSubClient(response.data.business_name || response.data.name, response.data.id);
                setShowNewSubClientForm(false);
                setNewSubClientData({ business_name: '', tax_id: '' });
                setShowSubClientResults(false);
                
                // Actualizar la lista de subclientes
                const updatedResponse = await api.get(`/clients/${shipment.clientId}/subclients`);
                if (updatedResponse && updatedResponse.data) {
                    setSubClients(Array.isArray(updatedResponse.data) ? updatedResponse.data : []);
                }
            } else {
                console.error('Error en la respuesta al crear subcliente:', response);
                alert(response?.msg || 'Error al crear el subcliente');
            }
        } catch (error) {
            console.error('Error detallado al crear subcliente:', error);
            alert(`Error al crear el subcliente: ${error.message || 'Error desconocido'}`);
        }
    };

    // Filtrar sub clientes basados en la búsqueda
    const filteredSubClients = subClients.filter(subClient => 
        subClient.name?.toLowerCase().includes(subClientSearchQuery.toLowerCase()) ||
        subClient.business_name?.toLowerCase().includes(subClientSearchQuery.toLowerCase()) ||
        subClient.tax_id?.includes(subClientSearchQuery)
    );

    // Manejar clics fuera del componente para cerrar resultados
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowResults(false);
            }
            if (subClientWrapperRef.current && !subClientWrapperRef.current.contains(event.target)) {
                setShowSubClientResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef, subClientWrapperRef]);

    const toggleSubClientMode = () => {
        setUseCustomSubClient(!useCustomSubClient);
        setSubClientSearchQuery('');
        handleSelectSubClient('', null);
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Información básica</h2>
                <p className="text-sm text-gray-600">Para comenzar, ingresa el código de referencia y selecciona el cliente.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="space-y-4">
                    {/* Código de referencia */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código de Referencia *
                        </label>
                        <input
                            type="text"
                            value={shipment.refCode}
                            onChange={(e) => handleChange('refCode', e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.refCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                } focus:outline-none focus:ring-2 transition-colors text-gray-900`}
                            placeholder="Ingresa un código único de referencia"
                        />
                        {errors.refCode && (
                            <p className="mt-1 text-sm text-red-500">{errors.refCode}</p>
                        )}
                    </div>

                    {/* Selector de cliente principal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cliente Principal *
                        </label>
                        <div className="relative" ref={wrapperRef}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    className={`w-full pl-10 pr-10 py-3 rounded-xl border ${errors.cliente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                        } focus:outline-none focus:ring-2 transition-colors text-gray-900`}
                                    placeholder="Buscar cliente por nombre o CUIT"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        handleSelectClient(e.target.value);
                                        setShowResults(true);
                                    }}
                                    onFocus={() => setShowResults(true)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => {
                                            setSearchQuery('');
                                            handleSelectClient('');
                                        }}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {showResults && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {loading ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                            Buscando clientes...
                                        </div>
                                    ) : clients.length > 0 ? (
                                        <ul className="py-1">
                                            {clients.map((client) => (
                                                <li
                                                    key={client.id}
                                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                                                    onClick={() => {
                                                        handleSelectClient(client);
                                                        setShowResults(false);
                                                    }}
                                                >
                                                    <div className="font-medium text-gray-800">{client.business_name || client.name}</div>
                                                    {client.tax_id && (
                                                        <div className="text-xs text-gray-500">CUIT: {client.tax_id}</div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : searchQuery.length >= 2 ? (
                                        <div className="p-5">
                                            <p className="text-sm text-gray-500 mb-3">No se encontraron resultados para "{searchQuery}"</p>
                                            {showNewClientForm ? (
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-sm text-gray-700">Crear nuevo cliente</h4>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={newClientData.business_name}
                                                            onChange={(e) => setNewClientData({...newClientData, business_name: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Nombre del cliente *"
                                                        />
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={newClientData.tax_id}
                                                            onChange={(e) => setNewClientData({...newClientData, tax_id: e.target.value})}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="CUIT/RUT"
                                                        />
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleCreateClient}
                                                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewClientForm(false)}
                                                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    onClick={() => setShowNewClientForm(true)}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Crear nuevo cliente
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-500">
                                            Escribe al menos 2 caracteres para buscar
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {errors.cliente && (
                            <p className="mt-1 text-sm text-red-500">{errors.cliente}</p>
                        )}
                    </div>

                    {/* Selector de sub cliente con opción de texto libre */}
                    {shipment.clientId && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Sub Cliente
                                    <span className="text-gray-500 font-normal ml-1">(Opcional)</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={toggleSubClientMode}
                                    className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                                >
                                    {useCustomSubClient ? (
                                        <>
                                            <Users className="w-4 h-4 mr-1" />
                                            Seleccionar de la lista
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="w-4 h-4 mr-1" />
                                            Ingresar manualmente
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {/* Modo de texto libre */}
                            {useCustomSubClient ? (
                                <div className="relative">
                                    <Edit className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        className={`w-full pl-10 pr-10 py-3 rounded-xl border ${errors.subCliente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                            } focus:outline-none focus:ring-2 transition-colors text-gray-900`}
                                        placeholder="Ingresa el nombre del sub cliente"
                                        value={subClientSearchQuery}
                                        onChange={(e) => {
                                            setSubClientSearchQuery(e.target.value);
                                            handleSelectSubClient(e.target.value, null);
                                        }}
                                    />
                                    {subClientSearchQuery && (
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            onClick={() => {
                                                setSubClientSearchQuery('');
                                                handleSelectSubClient('', null);
                                            }}
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                // Modo de selección de lista (original)
                                <div className="relative" ref={subClientWrapperRef}>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            className={`w-full pl-10 pr-10 py-3 rounded-xl border ${errors.subCliente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                                                } focus:outline-none focus:ring-2 transition-colors text-gray-900`}
                                            placeholder={loadingSubClients ? "Cargando sub clientes..." : "Buscar o seleccionar sub cliente"}
                                            value={subClientSearchQuery}
                                            onChange={(e) => {
                                                setSubClientSearchQuery(e.target.value);
                                                handleSelectSubClient(e.target.value, null);
                                                setShowSubClientResults(true);
                                            }}
                                            onFocus={() => setShowSubClientResults(true)}
                                            disabled={loadingSubClients}
                                        />
                                        {subClientSearchQuery && (
                                            <button
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                onClick={() => {
                                                    setSubClientSearchQuery('');
                                                    handleSelectSubClient('', null);
                                                }}
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    {showSubClientResults && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                            {loadingSubClients ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                                    Cargando sub clientes...
                                                </div>
                                            ) : filteredSubClients.length > 0 ? (
                                                <ul className="py-1">
                                                    {filteredSubClients.map((subClient) => (
                                                        <li
                                                            key={subClient.id}
                                                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
                                                            onClick={() => {
                                                                handleSelectSubClient(subClient.business_name || subClient.name, subClient.id);
                                                                setSubClientSearchQuery(subClient.business_name || subClient.name);
                                                                setShowSubClientResults(false);
                                                            }}
                                                        >
                                                            <div className="font-medium text-gray-800">{subClient.business_name || subClient.name}</div>
                                                            {subClient.tax_id && (
                                                                <div className="text-xs text-gray-500">CUIT: {subClient.tax_id}</div>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="p-5">
                                                    <p className="text-sm text-gray-500 mb-3">
                                                        {subClients.length === 0 
                                                            ? "No hay sub clientes disponibles para este cliente" 
                                                            : `No se encontraron resultados para "${subClientSearchQuery}"`}
                                                    </p>
                                                    {showNewSubClientForm ? (
                                                        <div className="space-y-3">
                                                            <h4 className="font-medium text-sm text-gray-700">Crear nuevo sub cliente</h4>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    value={newSubClientData.business_name}
                                                                    onChange={(e) => setNewSubClientData({...newSubClientData, business_name: e.target.value})}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Nombre del sub cliente *"
                                                                />
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    value={newSubClientData.tax_id}
                                                                    onChange={(e) => setNewSubClientData({...newSubClientData, tax_id: e.target.value})}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="CUIT/RUT"
                                                                />
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={handleCreateSubClient}
                                                                    className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                                >
                                                                    Guardar
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowNewSubClientForm(false)}
                                                                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                                                            onClick={() => setShowNewSubClientForm(true)}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            Crear nuevo sub cliente
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            {errors.subCliente && (
                                <p className="mt-1 text-sm text-red-500">{errors.subCliente}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientSelector;