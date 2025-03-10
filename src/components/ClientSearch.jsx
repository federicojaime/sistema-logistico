import { useState, useEffect, useRef } from 'react';
import { X, Plus, Search } from 'lucide-react';
import api from '../services/api';

// Componente de búsqueda de clientes con autocompletado
const ClientSearch = ({ value, onChange, onCreateNew }) => {
    const [query, setQuery] = useState('');
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef(null);

    // Cargar clientes basados en la consulta
    useEffect(() => {
        const fetchClients = async () => {
            if (!query.trim() || query.length < 2) {
                setClients([]);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(`/clients?search=${encodeURIComponent(query)}`);
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
    }, [query]);

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
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Buscar cliente..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                />
                {query && (
                    <button
                        className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => {
                            setQuery('');
                            onChange('');
                        }}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Search className="w-5 h-5" />
                </div>
            </div>

            {showResults && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Buscando clientes...</div>
                    ) : clients.length > 0 ? (
                        <ul>
                            {clients.map((client) => (
                                <li
                                    key={client.id}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => {
                                        setQuery(client.business_name || client.name);
                                        onChange(client);
                                        setShowResults(false);
                                    }}
                                >
                                    <div className="font-medium">{client.business_name || client.name}</div>
                                    {client.tax_id && <div className="text-xs text-gray-500">{client.tax_id}</div>}
                                </li>
                            ))}
                        </ul>
                    ) : query.length >= 2 ? (
                        <div className="p-4">
                            <p className="text-sm text-gray-500 mb-2">No se encontraron resultados para "{query}"</p>
                            <button
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                onClick={() => {
                                    onCreateNew(query);
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
    );
};

export default ClientSearch;