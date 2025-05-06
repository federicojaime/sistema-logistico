// src/components/shipment-creation/components/ClientSelector.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, X } from 'lucide-react';
import api from '../../../services/api';

const ClientSelector = ({ shipment, handleChange, handleSelectClient, errors }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef(null);

    // Inicializar la consulta con el valor actual si existe
    useEffect(() => {
        if (shipment.cliente) {
            setSearchQuery(shipment.cliente);
        }
    }, [shipment.cliente]);

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

    // Manejar clics fuera del componente para cerrar resultados
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [wrapperRef]);

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

                    {/* Selector de cliente */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cliente *
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
                                            <button
                                                type="button"
                                                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                                                onClick={() => {
                                                    // Aquí iría la lógica para crear un nuevo cliente
                                                    alert('Funcionalidad para crear nuevo cliente');
                                                    setShowResults(false);
                                                }}
                                            >
                                                <Plus className="w-4 h-4" />
                                                Crear nuevo cliente
                                            </button>
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
                </div>
            </div>
        </div>
    );
};

export default ClientSelector;