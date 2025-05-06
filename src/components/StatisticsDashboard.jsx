import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    TrendingUp,
    Calendar,
    Users,
    Truck,
    Package,
    DollarSign,
    MapPin,
    BarChart2,
    PieChart,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    FileText,
    Clock,
    Filter
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, PieChart as RechartPieChart, Pie, ResponsiveContainer,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';
import api from '../services/api';

// Componente principal del Dashboard
const StatisticsDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
    const [dashboardData, setDashboardData] = useState({
        totals: {
            shipments: 0,
            clients: 0,
            drivers: 0,
            revenue: 0,
            pendingShipments: 0,
            completedShipments: 0,
            cancelledShipments: 0,
            transitShipments: 0
        },
        trends: {
            shipmentsByDate: [],
            revenueByDate: [],
            shipmentsByStatus: [],
            shipmentsByDriver: [],
            topDestinations: [],
            topClients: []
        },
        performance: {
            avgDeliveryTime: 0,
            onTimeDelivery: 0,
            lateDeliveries: 0,
            driverEfficiency: []
        }
    });

    useEffect(() => {
        // Comprobar si el usuario es administrador
        if (user && user.role !== 'admin') {
            navigate('/logistica/home');
            return;
        }

        loadDashboardData();
    }, [user, navigate, timeRange]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // En un entorno real, estas serían llamadas API reales a endpoints de estadísticas
            // Por ahora, usaremos datos simulados para la demostración

            // Simular carga de datos
            await new Promise(resolve => setTimeout(resolve, 800));

            // Datos simulados
            const mockData = generateMockData(timeRange);
            setDashboardData(mockData);
            setError(null);
        } catch (err) {
            console.error('Error al cargar datos del dashboard:', err);
            setError('Error al cargar las estadísticas. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Generar datos simulados basados en el rango de tiempo
    const generateMockData = (range) => {
        // Diferentes períodos para diferentes rangos de tiempo
        let periods = [];
        let shipmentCount = 0;
        let completedCount = 0;
        let cancelledCount = 0;
        let transitCount = 0;
        let pendingCount = 0;
        let totalRevenue = 0;

        switch (range) {
            case 'week':
                periods = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                shipmentCount = 28;
                totalRevenue = 12500;
                break;
            case 'month':
                periods = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
                shipmentCount = 120;
                totalRevenue = 52000;
                break;
            case 'quarter':
                periods = ['Ene', 'Feb', 'Mar'];
                shipmentCount = 350;
                totalRevenue = 142000;
                break;
            case 'year':
                periods = ['T1', 'T2', 'T3', 'T4'];
                shipmentCount = 1200;
                totalRevenue = 580000;
                break;
            default:
                periods = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        }

        // Distribuir estados
        completedCount = Math.round(shipmentCount * 0.65);
        cancelledCount = Math.round(shipmentCount * 0.05);
        transitCount = Math.round(shipmentCount * 0.20);
        pendingCount = shipmentCount - completedCount - cancelledCount - transitCount;

        // Datos de tendencias
        const shipmentsByDate = periods.map((period, index) => {
            const value = Math.floor(Math.random() * (shipmentCount / periods.length * 1.5) + shipmentCount / periods.length * 0.5);
            return { name: period, value };
        });

        const revenueByDate = periods.map((period, index) => {
            const value = Math.floor(Math.random() * (totalRevenue / periods.length * 1.5) + totalRevenue / periods.length * 0.7);
            return { name: period, value };
        });

        const shipmentsByStatus = [
            { name: 'Completados', value: completedCount },
            { name: 'En tránsito', value: transitCount },
            { name: 'Pendientes', value: pendingCount },
            { name: 'Cancelados', value: cancelledCount }
        ];

        const driverNames = ['Carlos Rodríguez', 'Juan Pérez', 'Roberto Sánchez', 'Ana Martínez', 'Luis González'];

        const shipmentsByDriver = driverNames.map(name => ({
            name,
            value: Math.floor(Math.random() * (shipmentCount / 5 * 1.3) + shipmentCount / 5 * 0.7)
        })).sort((a, b) => b.value - a.value);

        const destinations = ['Miami, FL', 'Orlando, FL', 'Tampa, FL', 'Fort Lauderdale, FL', 'Jacksonville, FL', 'Naples, FL'];

        const topDestinations = destinations.map(name => ({
            name,
            value: Math.floor(Math.random() * (shipmentCount / 6 * 1.3) + shipmentCount / 6 * 0.7)
        })).sort((a, b) => b.value - a.value);

        const clients = ['Global Logistics Inc.', 'Cargas Express', 'TransMiami LLC', 'FastDeliver S.A.', 'Cargo Services'];

        const topClients = clients.map(name => ({
            name,
            value: Math.floor(Math.random() * (shipmentCount / 5 * 1.3) + shipmentCount / 5 * 0.7)
        })).sort((a, b) => b.value - a.value);

        // Datos de rendimiento
        const driverEfficiency = driverNames.map(name => ({
            name,
            onTime: Math.floor(Math.random() * 30) + 70, // Porcentaje a tiempo (70-100%)
            shipments: Math.floor(Math.random() * (shipmentCount / 5 * 1.3) + shipmentCount / 5 * 0.7)
        })).sort((a, b) => b.onTime - a.onTime);

        return {
            totals: {
                shipments: shipmentCount,
                clients: clients.length,
                drivers: driverNames.length,
                revenue: totalRevenue,
                pendingShipments: pendingCount,
                completedShipments: completedCount,
                cancelledShipments: cancelledCount,
                transitShipments: transitCount
            },
            trends: {
                shipmentsByDate,
                revenueByDate,
                shipmentsByStatus,
                shipmentsByDriver,
                topDestinations,
                topClients
            },
            performance: {
                avgDeliveryTime: Math.floor(Math.random() * 24) + 48, // Horas promedio (48-72)
                onTimeDelivery: Math.floor(Math.random() * 15) + 80, // Porcentaje (80-95%)
                lateDeliveries: Math.floor(Math.random() * 20), // Porcentaje (0-20%)
                driverEfficiency
            }
        };
    };

    // Colores para gráficos
    const colors = {
        primary: '#3b82f6',
        secondary: '#10b981',
        tertiary: '#f59e0b',
        quaternary: '#ef4444',
        gray: '#6b7280',
        completed: '#10b981',
        transit: '#3b82f6',
        pending: '#f59e0b',
        cancelled: '#ef4444',
        chartColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
    };

    // Formateo de números
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Renderizar estado de carga
    if (loading && !dashboardData.totals.shipments) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <BarChart2 className="w-6 h-6 text-blue-600 mr-2" />
                    Dashboard de Estadísticas
                </h1>

                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
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
                        onClick={loadDashboardData}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tarjetas resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <SummaryCard
                    title="Total de Envíos"
                    value={dashboardData.totals.shipments}
                    icon={<Package className="w-6 h-6 text-blue-600" />}
                    color="bg-blue-50 border-blue-200"
                    change={4.5}
                />

                <SummaryCard
                    title="Ingresos Totales"
                    value={formatCurrency(dashboardData.totals.revenue)}
                    icon={<DollarSign className="w-6 h-6 text-green-600" />}
                    color="bg-green-50 border-green-200"
                    change={2.7}
                />

                <SummaryCard
                    title="Clientes Activos"
                    value={dashboardData.totals.clients}
                    icon={<Users className="w-6 h-6 text-purple-600" />}
                    color="bg-purple-50 border-purple-200"
                    change={1.2}
                />

                <SummaryCard
                    title="Transportistas"
                    value={dashboardData.totals.drivers}
                    icon={<Truck className="w-6 h-6 text-amber-600" />}
                    color="bg-amber-50 border-amber-200"
                    change={0}
                />
            </div>

            {/* Estado de envíos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Estado de Envíos</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatusCard
                        title="Pendientes"
                        value={dashboardData.totals.pendingShipments}
                        icon={<Clock className="w-5 h-5 text-amber-600" />}
                        color="bg-amber-50 border-amber-200 text-amber-800"
                        percentage={Math.round((dashboardData.totals.pendingShipments / dashboardData.totals.shipments) * 100)}
                    />

                    <StatusCard
                        title="En tránsito"
                        value={dashboardData.totals.transitShipments}
                        icon={<Truck className="w-5 h-5 text-blue-600" />}
                        color="bg-blue-50 border-blue-200 text-blue-800"
                        percentage={Math.round((dashboardData.totals.transitShipments / dashboardData.totals.shipments) * 100)}
                    />

                    <StatusCard
                        title="Completados"
                        value={dashboardData.totals.completedShipments}
                        icon={<Package className="w-5 h-5 text-green-600" />}
                        color="bg-green-50 border-green-200 text-green-800"
                        percentage={Math.round((dashboardData.totals.completedShipments / dashboardData.totals.shipments) * 100)}
                    />

                    <StatusCard
                        title="Cancelados"
                        value={dashboardData.totals.cancelledShipments}
                        icon={<FileText className="w-5 h-5 text-red-600" />}
                        color="bg-red-50 border-red-200 text-red-800"
                        percentage={Math.round((dashboardData.totals.cancelledShipments / dashboardData.totals.shipments) * 100)}
                    />
                </div>
            </div>

            {/* Gráficos de tendencias */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Gráfico de envíos por tiempo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Tendencia de Envíos</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.trends.shipmentsByDate} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [value, 'Envíos']} />
                            <Legend />
                            <Line type="monotone" dataKey="value" name="Envíos" stroke={colors.primary} strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico de ingresos por tiempo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Tendencia de Ingresos</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.trends.revenueByDate} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => [formatCurrency(value), 'Ingresos']} />
                            <Legend />
                            <Line type="monotone" dataKey="value" name="Ingresos" stroke={colors.secondary} strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Gráfico circular de estados */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Distribución por Estado</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartPieChart>
                            <Pie
                                data={dashboardData.trends.shipmentsByStatus}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                labelLine={false}
                                label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {dashboardData.trends.shipmentsByStatus.map((entry, index) => {
                                    let color;
                                    switch (entry.name) {
                                        case 'Completados': color = colors.completed; break;
                                        case 'En tránsito': color = colors.transit; break;
                                        case 'Pendientes': color = colors.pending; break;
                                        case 'Cancelados': color = colors.cancelled; break;
                                        default: color = colors.chartColors[index % colors.chartColors.length];
                                    }
                                    return <Cell key={`cell-${index}`} fill={color} />;
                                })}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, name]} />
                            <Legend />
                        </RechartPieChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico de barras de transportistas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Envíos por Transportista</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={dashboardData.trends.shipmentsByDriver}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip />
                            <Bar dataKey="value" name="Envíos" fill={colors.tertiary} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top destinos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Destinos Principales</h2>
                    <div className="space-y-4">
                        {dashboardData.trends.topDestinations.slice(0, 5).map((destination, index) => (
                            <div key={index} className="flex items-center">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 mr-3 font-medium">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{destination.name}</span>
                                        <span className="text-sm text-gray-500">{destination.value} envíos</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${Math.min(100, (destination.value / dashboardData.trends.topDestinations[0].value) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top clientes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Clientes Principales</h2>
                    <div className="space-y-4">
                        {dashboardData.trends.topClients.slice(0, 5).map((client, index) => (
                            <div key={index} className="flex items-center">
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-800 mr-3 font-medium">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-gray-700">{client.name}</span>
                                        <span className="text-sm text-gray-500">{client.value} envíos</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-green-600 h-2.5 rounded-full"
                                            style={{ width: `${Math.min(100, (client.value / dashboardData.trends.topClients[0].value) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Métricas de rendimiento */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Métricas de Rendimiento</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl">
                        <div className="text-3xl font-bold text-gray-800 mb-2">
                            {dashboardData.performance.avgDeliveryTime}h
                        </div>
                        <div className="text-sm text-gray-600 text-center">
                            Tiempo Promedio de Entrega
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-xl">
                        <div className="text-3xl font-bold text-green-800 mb-2">
                            {dashboardData.performance.onTimeDelivery}%
                        </div>
                        <div className="text-sm text-green-600 text-center">
                            Entregas a Tiempo
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-xl">
                        <div className="text-3xl font-bold text-red-800 mb-2">
                            {dashboardData.performance.lateDeliveries}%
                        </div>
                        <div className="text-sm text-red-600 text-center">
                            Entregas con Retraso
                        </div>
                    </div>
                </div>

                <h3 className="text-md font-medium text-gray-700 mb-3">Eficiencia de Transportistas</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Transportista
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Envíos
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Entregas a Tiempo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Eficiencia
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dashboardData.performance.driverEfficiency.map((driver, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {driver.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {driver.shipments}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {driver.onTime}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${driver.onTime >= 90 ? 'bg-green-600' : driver.onTime >= 80 ? 'bg-yellow-400' : 'bg-red-500'}`}
                                                style={{ width: `${driver.onTime}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Nota informativa */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-700 text-sm">
                <p>
                    <strong>Nota:</strong> Este dashboard muestra datos estadísticos acumulados. Los datos mostrados son simulados con fines demostrativos.
                    En una implementación real, estos datos provendrían de la API del sistema.
                </p>
            </div>
        </div>
    );
};

// Componente de tarjeta resumen
const SummaryCard = ({ title, value, icon, color, change }) => {
    return (
        <div className={`p-6 rounded-xl shadow-sm ${color} border`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                </div>
                <div className="p-2 rounded-full bg-white/80 shadow-sm">
                    {icon}
                </div>
            </div>

            {change !== undefined && (
                <div className="mt-4 flex items-center">
                    {change > 0 ? (
                        <span className="text-green-600 text-xs font-medium flex items-center">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            {change}% vs. periodo anterior
                        </span>
                    ) : change < 0 ? (
                        <span className="text-red-600 text-xs font-medium flex items-center">
                            <ArrowDown className="w-3 h-3 mr-1" />
                            {Math.abs(change)}% vs. periodo anterior
                        </span>
                    ) : (
                        <span className="text-gray-600 text-xs font-medium flex items-center">
                            Sin cambios vs. periodo anterior
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

// Componente de tarjeta de estado
const StatusCard = ({ title, value, icon, color, percentage }) => {
    return (
        <div className={`p-4 rounded-lg ${color}`}>
            <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium">{title}</p>
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-1">{value}</h3>
            <div className="flex justify-between items-center text-xs">
                <span>{percentage}% del total</span>
                <span>{value} envíos</span>
            </div>
        </div>
    );
};

export default StatisticsDashboard;