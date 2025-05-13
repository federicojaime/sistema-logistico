// StatisticsDashboard.jsx con correcciones y logs adicionales
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    BarChart2, Package, DollarSign, Users, 
    Truck, RefreshCw, Filter, Calendar, 
    ChevronDown, ChevronUp, Download, AlertTriangle
} from 'lucide-react';
import {
    BarChart, Bar, PieChart, Pie, ResponsiveContainer,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';
import statisticsService from '../services/statisticsService';

const StatisticsDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('month');
    const [showFilters, setShowFilters] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        shipments: {
            total: 0,
            pending: 0,
            inTransit: 0,
            delivered: 0,
            cancelled: 0
        },
        clients: {
            total: 0,
            active: 0
        },
        revenue: 0,
        topClients: [],
        topDrivers: [],
        shipmentsByStatus: []
    });
    const [dateRange, setDateRange] = useState({
        from: '',
        to: ''
    });
    const [filters, setFilters] = useState({
        client_id: '',
        driver_id: '',
        status: ''
    });
    const [availableClients, setAvailableClients] = useState([]);
    const [availableDrivers, setAvailableDrivers] = useState([]);

    // Verificar permisos y cargar datos iniciales
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/logistica/home');
            return;
        }

        calculateDateRange();
        loadAvailableFilters();
    }, [user, navigate]);

    // Cargar datos cuando cambia el timeRange
    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            loadDashboardData();
        }
    }, [timeRange, dateRange.from, dateRange.to]);

    // Calcular rango de fechas basado en el timeRange
    const calculateDateRange = () => {
        const today = new Date();
        let fromDate = new Date();

        switch (timeRange) {
            case 'week':
                fromDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                fromDate.setMonth(today.getMonth() - 1);
                break;
            case 'quarter':
                fromDate.setMonth(today.getMonth() - 3);
                break;
            case 'year':
                fromDate.setFullYear(today.getFullYear() - 1);
                break;
            default:
                fromDate.setMonth(today.getMonth() - 1);
        }

        // Formatear fechas (YYYY-MM-DD)
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };

        const newDateRange = {
            from: formatDate(fromDate),
            to: formatDate(today)
        };
        
        console.log("Rango de fechas calculado:", newDateRange);
        setDateRange(newDateRange);
    };

    // Cargar clientes y conductores para filtros
    const loadAvailableFilters = async () => {
        try {
            console.log("Cargando filtros disponibles...");
            
            const [clientsResponse, driversResponse] = await Promise.all([
                statisticsService.getClientsList(),
                statisticsService.getDriversList()
            ]);

            console.log("Respuesta de clientes:", clientsResponse);
            console.log("Respuesta de conductores:", driversResponse);

            if (clientsResponse && clientsResponse.ok) {
                setAvailableClients(clientsResponse.data || []);
                console.log("Clientes cargados:", clientsResponse.data);
            } else {
                console.warn("Error al cargar clientes:", clientsResponse);
            }

            if (driversResponse && driversResponse.ok) {
                setAvailableDrivers(driversResponse.data || []);
                console.log("Conductores cargados:", driversResponse.data);
            } else {
                console.warn("Error al cargar conductores:", driversResponse);
            }
        } catch (err) {
            console.error('Error al cargar filtros:', err);
        }
    };

    // Cargar datos del dashboard
    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const combinedFilters = {
                ...filters,
                date_from: dateRange.from,
                date_to: dateRange.to
            };

            console.log("Cargando datos del dashboard con filtros:", combinedFilters);

            // Obtener datos de estadísticas
            const response = await statisticsService.getDashboardStatistics(combinedFilters);
            
            console.log("Respuesta completa de estadísticas:", response);
            
            if (response && response.ok) {
                // Transformar datos para el dashboard
                const { data } = response;
                console.log("Datos recibidos del servidor:", data);
                
                // Asegurarse de que todas las propiedades existan antes de usarlas
                const counts = data.counts || {};
                const financialSummary = data.financialSummary || {};
                const topClients = data.top_clients || data.topClients || [];
                const topDrivers = data.top_drivers || data.topDrivers || [];
                
                console.log("Contadores:", counts);
                console.log("Resumen financiero:", financialSummary);
                console.log("Top clientes:", topClients);
                console.log("Top conductores:", topDrivers);
                
                const processedData = {
                    shipments: {
                        total: counts.total_shipments || 0,
                        pending: counts.pending_shipments || 0,
                        inTransit: counts.in_transit_shipments || 0,
                        delivered: counts.delivered_shipments || 0,
                        cancelled: counts.cancelled_shipments || 0
                    },
                    clients: {
                        total: counts.active_clients || 0,
                        active: counts.active_clients || 0
                    },
                    revenue: financialSummary?.total_shipping_revenue || 0,
                    topClients: topClients.slice(0, 5).map(client => ({
                        ...client,
                        business_name: client.business_name || client.client_name || 'Cliente sin nombre',
                        shipment_count: client.shipment_count || client.count || 0,
                        total_revenue: client.total_revenue || 0
                    })),
                    topDrivers: topDrivers.slice(0, 5).map(driver => ({
                        ...driver,
                        driver_name: driver.driver_name || 'Conductor sin nombre',
                        shipment_count: driver.shipment_count || driver.count || 0,
                        total_revenue: driver.total_revenue || 0
                    })),
                    shipmentsByStatus: [
                        { name: 'Pendientes', value: counts.pending_shipments || 0 },
                        { name: 'En tránsito', value: counts.in_transit_shipments || 0 },
                        { name: 'Entregados', value: counts.delivered_shipments || 0 },
                        { name: 'Cancelados', value: counts.cancelled_shipments || 0 }
                    ]
                };
                
                console.log("Datos procesados para el dashboard:", processedData);
                setDashboardData(processedData);
            } else {
                console.error("Error en la respuesta:", response);
                setError('Error al cargar estadísticas: ' + (response?.msg || 'Respuesta inválida del servidor'));
            }
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar las estadísticas: ' + (err.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    // Manejar cambios en los filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        console.log(`Filtro cambiado: ${name} = ${value}`);
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Aplicar filtros
    const applyFilters = () => {
        console.log("Aplicando filtros:", filters);
        loadDashboardData();
    };

    // Resetear filtros
    const resetFilters = () => {
        console.log("Reseteando filtros");
        setFilters({
            client_id: '',
            driver_id: '',
            status: ''
        });
        setTimeout(() => {
            loadDashboardData();
        }, 100);
    };

    // Exportar estadísticas
    const handleExportStatistics = async (type) => {
        try {
            console.log(`Exportando estadísticas de tipo: ${type}`);
            await statisticsService.exportStatistics(type, {
                date_from: dateRange.from,
                date_to: dateRange.to,
                ...filters
            });
        } catch (error) {
            console.error('Error al exportar estadísticas:', error);
            setError('Error al exportar las estadísticas: ' + (error.message || 'Error desconocido'));
        }
    };

    // Formatear moneda
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Colores para gráficos
    const colors = {
        pending: '#f59e0b',     // Amber
        inTransit: '#3b82f6',   // Blue
        delivered: '#10b981',   // Green
        cancelled: '#ef4444',   // Red
        chartColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    };

    // Mostrar spinner mientras se cargan los datos iniciales
    if (loading && !dashboardData.shipments.total) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Cargando estadísticas...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            {/* Cabecera y controles */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <BarChart2 className="w-6 h-6 text-blue-600 mr-2" />
                    Dashboard de Estadísticas
                </h1>

                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => {
                                console.log("Cambiando rango de tiempo a:", e.target.value);
                                setTimeRange(e.target.value);
                                setTimeout(calculateDateRange, 10);
                            }}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
                        >
                            <option value="week">Última semana</option>
                            <option value="month">Último mes</option>
                            <option value="quarter">Último trimestre</option>
                            <option value="year">Último año</option>
                        </select>
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                        {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                    </button>

                    <button
                        onClick={() => {
                            console.log("Actualizando datos del dashboard");
                            loadDashboardData();
                        }}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </button>

                    <button
                        onClick={() => handleExportStatistics('general')}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Filtros */}
            {showFilters && (
                <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Filtros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Cliente
                            </label>
                            <select
                                id="client_id"
                                name="client_id"
                                value={filters.client_id}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">Todos los clientes</option>
                                {availableClients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.business_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="driver_id" className="block text-sm font-medium text-gray-700 mb-1">
                                Transportista
                            </label>
                            <select
                                id="driver_id"
                                name="driver_id"
                                value={filters.driver_id}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">Todos los transportistas</option>
                                {availableDrivers.map(driver => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.firstname} {driver.lastname}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Estado de envíos
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">Todos los estados</option>
                                <option value="pendiente">Pendientes</option>
                                <option value="en_transito">En tránsito</option>
                                <option value="entregado">Entregados</option>
                                <option value="cancelado">Cancelados</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 gap-2">
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Resetear
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            )}

            {/* Mensajes de error */}
            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Indicadores clave */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-6 rounded-xl shadow-sm bg-blue-50 border border-blue-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total de Envíos</p>
                            <h3 className="text-2xl font-bold text-gray-800">{dashboardData.shipments.total}</h3>
                        </div>
                        <div className="p-2 rounded-full bg-white/80 shadow-sm">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl shadow-sm bg-green-50 border border-green-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Ingresos Totales</p>
                            <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(dashboardData.revenue)}</h3>
                        </div>
                        <div className="p-2 rounded-full bg-white/80 shadow-sm">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl shadow-sm bg-purple-50 border border-purple-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Clientes Activos</p>
                            <h3 className="text-2xl font-bold text-gray-800">{dashboardData.clients.active}</h3>
                        </div>
                        <div className="p-2 rounded-full bg-white/80 shadow-sm">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl shadow-sm bg-amber-50 border border-amber-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Tasa de Entrega Exitosa</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                {dashboardData.shipments.total > 0 
                                    ? `${((dashboardData.shipments.delivered / dashboardData.shipments.total) * 100).toFixed(1)}%` 
                                    : '0%'}
                            </h3>
                        </div>
                        <div className="p-2 rounded-full bg-white/80 shadow-sm">
                            <Truck className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Estado de envíos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Estado de Envíos</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-amber-50 border-amber-200 text-amber-800">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium">Pendientes</p>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{dashboardData.shipments.pending}</h3>
                        <div className="flex justify-between items-center text-xs">
                            <span>
                                {dashboardData.shipments.total > 0 
                                    ? `${((dashboardData.shipments.pending / dashboardData.shipments.total) * 100).toFixed(0)}%` 
                                    : '0%'} del total
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-50 border-blue-200 text-blue-800">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium">En tránsito</p>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{dashboardData.shipments.inTransit}</h3>
                        <div className="flex justify-between items-center text-xs">
                            <span>
                                {dashboardData.shipments.total > 0 
                                    ? `${((dashboardData.shipments.inTransit / dashboardData.shipments.total) * 100).toFixed(0)}%` 
                                    : '0%'} del total
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50 border-green-200 text-green-800">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium">Completados</p>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{dashboardData.shipments.delivered}</h3>
                        <div className="flex justify-between items-center text-xs">
                            <span>
                                {dashboardData.shipments.total > 0 
                                    ? `${((dashboardData.shipments.delivered / dashboardData.shipments.total) * 100).toFixed(0)}%` 
                                    : '0%'} del total
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-red-50 border-red-200 text-red-800">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium">Cancelados</p>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{dashboardData.shipments.cancelled}</h3>
                        <div className="flex justify-between items-center text-xs">
                            <span>
                                {dashboardData.shipments.total > 0 
                                    ? `${((dashboardData.shipments.cancelled / dashboardData.shipments.total) * 100).toFixed(0)}%` 
                                    : '0%'} del total
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Gráfico circular de estados */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Distribución por Estado</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dashboardData.shipmentsByStatus.filter(item => item.value > 0)}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {dashboardData.shipmentsByStatus.map((entry, index) => {
                                    let color;
                                    switch (entry.name) {
                                        case 'Entregados': color = colors.delivered; break;
                                        case 'En tránsito': color = colors.inTransit; break;
                                        case 'Pendientes': color = colors.pending; break;
                                        case 'Cancelados': color = colors.cancelled; break;
                                        default: color = colors.chartColors[index % colors.chartColors.length];
                                    }
                                    return <Cell key={`cell-${index}`} fill={color} />;
                                })}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, name]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico de barras de transportistas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Envíos por Transportista</h2>
                    {dashboardData.topDrivers && dashboardData.topDrivers.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={dashboardData.topDrivers.map(driver => ({
                                    name: driver.driver_name,
                                    shipments: driver.shipment_count || 0
                                }))}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} />
                                <Tooltip formatter={(value) => [value, 'Envíos']} />
                                <Legend />
                                <Bar dataKey="shipments" name="Envíos" fill="#f59e0b" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No hay datos disponibles sobre transportistas
                        </div>
                    )}
                </div>
            </div>

            {/* Top clientes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Clientes Principales</h2>
                {dashboardData.topClients && dashboardData.topClients.length > 0 ? (
                    <div className="space-y-4">
                        {dashboardData.topClients.map((client, index) => (
                            <div key={index} className="flex items-center">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-800 mr-3 font-medium">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{client.business_name || 'Cliente sin nombre'}</span>
                                        <span className="text-sm text-gray-500">
                                            {client.shipment_count || 0} envíos
                                            {client.total_revenue ? ` • ${formatCurrency(client.total_revenue)}` : ''}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-green-600 h-2.5 rounded-full"
                                            style={{ width: `${Math.min(100, (client.shipment_count / (dashboardData.topClients[0]?.shipment_count || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        No hay datos disponibles sobre clientes
                    </div>
                )}
            </div>

            {/* Opciones de exportación */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Exportar Estadísticas</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => handleExportStatistics('shipments')}
                        className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    >
                        <Package className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Envíos</span>
                    </button>

                    <button
                        onClick={() => handleExportStatistics('clients')}
                        className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                    >
                        <Users className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Clientes</span>
                    </button>

                    <button
                        onClick={() => handleExportStatistics('drivers')}
                        className="flex flex-col items-center justify-center p-4 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                    >
                        <Truck className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Transportistas</span>
                    </button>

                    <button
                        onClick={() => handleExportStatistics('general')}
                        className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors"
                    >
                        <BarChart2 className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Reporte General</span>
                    </button>
                </div>
            </div>

            {/* Nota informativa */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-700 text-sm">
                <p>
                    <strong>Nota:</strong> Este dashboard muestra estadísticas del período seleccionado. Para datos más detallados,
                    utilice las opciones de exportación.
                </p>
            </div>
        </div>
    );
};

export default StatisticsDashboard;