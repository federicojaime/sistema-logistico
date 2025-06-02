// ShipmentTable.jsx
import React, { useState } from 'react';
import { 
  Eye, 
  FileText, 
  Trash2, 
  Upload, 
  ArrowUpDown, 
  Info, 
  Palette, 
  Table,
  Users,
  MessageSquare
} from 'lucide-react';

const ShipmentTable = ({
    shipments,
    sortField,
    sortDirection,
    toggleSort,
    onViewDetails,
    onShowInvoice,
    onUploadPOD,
    onDelete,
    uploadingId,
    statusColors,
    statusMap,
    userRole,
    handlePODUpload
}) => {
    // Estado para alternar entre vista normal y vista con filas coloreadas
    // Vista coloreada es la por defecto ahora
    const [coloredRowView, setColoredRowView] = useState(true);

    // Función para obtener el color de fondo de la fila según el estado
    const getRowBackgroundColor = (status) => {
        if (!coloredRowView) return 'hover:bg-gray-50';
        
        const statusText = statusMap[status] || status;
        
        switch (statusText.toLowerCase()) {
            case 'pendiente':
                return 'bg-yellow-200 hover:bg-yellow-300 border-yellow-300';
            case 'en tránsito':
            case 'en transito':
                return 'bg-blue-200 hover:bg-blue-300 border-blue-300';
            case 'entregado':
                return 'bg-green-200 hover:bg-green-300 border-green-300';
            case 'cancelado':
                return 'bg-red-200 hover:bg-red-300 border-red-300';
            case 'en proceso':
                return 'bg-orange-200 hover:bg-orange-300 border-orange-300';
            case 'devuelto':
                return 'bg-purple-200 hover:bg-purple-300 border-purple-300';
            default:
                return 'bg-gray-200 hover:bg-gray-300 border-gray-300';
        }
    };

    // Función para obtener el color del texto del estado (solo para la vista normal)
    const getStatusBadgeColor = (status) => {
        if (coloredRowView) {
            // En vista coloreada, usar un badge más sutil
            return 'bg-white/80 text-gray-800 border border-gray-300';
        }
        // Vista normal con colores originales
        return statusColors[statusMap[status]] || 'bg-gray-100 text-gray-800';
    };

    // Función para formatear la dirección de destino - MEJORADA
    const formatDestination = (address) => {
        if (!address) return '';
        
        // Extraer información útil de la dirección
        const extractCityAndZip = (fullAddress) => {
            // Patrones comunes para ZIP codes (5 dígitos o 5+4)
            const zipPattern = /\b(\d{5}(?:-\d{4})?)\b/;
            const zipMatch = fullAddress.match(zipPattern);
            
            // Dividir por comas para obtener partes
            const parts = fullAddress.split(',').map(part => part.trim());
            
            let city = '';
            let zipCode = zipMatch ? zipMatch[1] : '';
            
            // Buscar la ciudad (generalmente antes del estado/país)
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                
                // Si encontramos una parte que parece una ciudad (no es número, no es muy larga)
                // y no contiene palabras como "Street", "Avenue", etc.
                if (part && 
                    !part.match(/^\d+/) && // No empieza con números
                    !part.match(/\b(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Terrace|Court|Ct)\b/i) && // No es tipo de calle
                    !part.match(/\b(Florida|FL|Estados Unidos|United States|USA|America)\b/i) && // No es estado/país
                    part.length > 2 && part.length < 30) { // Longitud razonable
                    
                    city = part;
                    break;
                }
            }
            
            // Si no encontramos ciudad, usar la penúltima parte (antes del estado generalmente)
            if (!city && parts.length >= 2) {
                // Filtrar partes que no sean estado/país
                const filteredParts = parts.filter(part => 
                    !part.match(/\b(Florida|FL|Estados Unidos|United States|USA|America)\b/i) &&
                    !part.match(/^\d+/) &&
                    part.length > 2
                );
                
                if (filteredParts.length > 0) {
                    city = filteredParts[filteredParts.length - 1]; // Tomar la más probable (última filtrada)
                }
            }
            
            return { city: city || 'Ciudad', zipCode };
        };
        
        const { city, zipCode } = extractCityAndZip(address);
        
        // Formatear el resultado
        let result = city;
        if (zipCode) {
            result += `, ${zipCode}`;
        }
        
        // Si el resultado es muy largo, truncar la ciudad
        if (result.length > 25) {
            const truncatedCity = city.length > 15 ? city.substring(0, 15) + '...' : city;
            result = zipCode ? `${truncatedCity}, ${zipCode}` : truncatedCity;
        }
        
        return (
            <div className="relative group">
                <div className="flex items-center">
                    <span className="truncate">{result}</span>
                    <Info className="h-4 w-4 ml-1 text-gray-400 flex-shrink-0" />
                </div>
                {/* Tooltip mejorado - posicionado para no cortarse */}
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white p-4 rounded-lg text-sm z-50 shadow-2xl border border-gray-700 w-80">
                    <div className="font-semibold mb-2 text-white">📍 Dirección completa:</div>
                    <div className="break-words text-gray-100 leading-relaxed whitespace-normal">
                        {address}
                    </div>
                    {/* Flecha del tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
            </div>
        );
    };

    // Función para formatear el cliente con sub cliente
    const formatCustomer = (customer, subclient) => {
        if (!subclient) {
            return <span className="text-sm font-medium text-gray-900 truncate block">{customer}</span>;
        }

        return (
            <div className="relative group">
                <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 truncate">{customer}</span>
                    <Users className="h-4 w-4 ml-1 text-blue-500 flex-shrink-0" />
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white p-3 rounded-lg text-sm z-50 shadow-2xl border border-gray-700 whitespace-nowrap">
                    <div className="font-semibold text-blue-300">👥 Sub Cliente:</div>
                    <div className="text-gray-100">{subclient}</div>
                    {/* Flecha del tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
            </div>
        );
    };

    // Función para formatear comentarios
    const formatComments = (comments) => {
        if (!comments || comments.trim() === '') {
            return <span className="text-gray-400 text-xs italic">Sin comentarios</span>;
        }

        // Mostrar solo los primeros 15 caracteres para dar más espacio
        const preview = comments.length > 15 ? comments.substring(0, 15) + '...' : comments;
        
        return (
            <div className="relative group">
                <div className="flex items-center">
                    <span className="text-sm text-gray-600 truncate">{preview}</span>
                    <MessageSquare className="h-4 w-4 ml-1 text-amber-500 flex-shrink-0" />
                </div>
                {/* Tooltip para comentarios - centrado */}
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-lg text-sm z-50 shadow-2xl w-80">
                    <div className="font-semibold mb-2 text-amber-800">💬 Comentarios / Instrucciones:</div>
                    <div className="break-words leading-relaxed whitespace-pre-line">
                        {comments}
                    </div>
                    {/* Flecha del tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-amber-200"></div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Botón para alternar vista */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>Mostrando {shipments.length} envío{shipments.length !== 1 ? 's' : ''}</span>
                </div>
                <button
                    onClick={() => setColoredRowView(!coloredRowView)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        coloredRowView 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={coloredRowView ? 'Vista normal' : 'Vista con filas coloreadas'}
                >
                    {coloredRowView ? (
                        <>
                            <Table className="w-4 h-4" />
                            <span className="hidden sm:inline">Vista Normal</span>
                        </>
                    ) : (
                        <>
                            <Palette className="w-4 h-4" />
                            <span className="hidden sm:inline">Vista Coloreada</span>
                        </>
                    )}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Estado */}
                            <th
                                className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-200"
                                onClick={() => toggleSort('status')}
                                style={{ width: '140px' }}
                            >
                                <div className="flex items-center gap-1">
                                    Estado
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            {/* Referencia */}
                            <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200" style={{ width: '140px' }}>
                                Referencia
                            </th>
                            {/* Cliente */}
                            <th
                                className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-200"
                                onClick={() => toggleSort('customer')}
                                style={{ width: '200px' }}
                            >
                                <div className="flex items-center gap-1">
                                    Cliente
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            {/* Destino */}
                            <th
                                className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-200"
                                onClick={() => toggleSort('destination')}
                                style={{ width: '180px' }}
                            >
                                <div className="flex items-center gap-1">
                                    Destino
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            {/* Fecha */}
                            <th
                                className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-200"
                                onClick={() => toggleSort('date')}
                                style={{ width: '120px' }}
                            >
                                <div className="flex items-center gap-1">
                                    Fecha
                                    <ArrowUpDown className="h-4 w-4" />
                                </div>
                            </th>
                            {/* Comentarios */}
                            <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase border-r border-gray-200" style={{ width: '180px' }}>
                                Comentarios
                            </th>
                            {/* Transportista */}
                            {(userRole === 'admin' || userRole === 'cliente') && (
                                <th
                                    className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-200"
                                    onClick={() => toggleSort('driver')}
                                    style={{ width: '160px' }}
                                >
                                    <div className="flex items-center gap-1">
                                        Transportista
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </th>
                            )}
                            {/* Acciones */}
                            <th className="px-4 py-4 text-right text-xs font-medium text-gray-500 uppercase" style={{ width: '120px' }}>
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {shipments.map((shipment, index) => (
                            <tr 
                                key={shipment.id} 
                                className={`transition-all duration-200 ${getRowBackgroundColor(shipment.status)} ${
                                    coloredRowView ? 'border-l-4' : ''
                                }`}
                            >
                                {/* Estado */}
                                <td className="px-4 py-5 whitespace-nowrap border-r border-gray-200">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${getStatusBadgeColor(shipment.status)}`}>
                                        {statusMap[shipment.status]}
                                    </span>
                                </td>
                                {/* Referencia */}
                                <td className="px-4 py-5 whitespace-nowrap text-sm text-gray-900 font-medium border-r border-gray-200">
                                    <div className="truncate">
                                        {shipment.ref_code || `#${shipment.id.toString().padStart(6, '0')}`}
                                    </div>
                                </td>
                                {/* Cliente */}
                                <td className="px-4 py-5 border-r border-gray-200">
                                    {formatCustomer(shipment.customer, shipment.subclient)}
                                </td>
                                {/* Destino */}
                                <td className="px-4 py-5 text-sm text-gray-500 border-r border-gray-200">
                                    {formatDestination(shipment.destination_address)}
                                </td>
                                {/* Fecha */}
                                <td className="px-4 py-5 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">
                                    {new Date(shipment.created_at).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </td>
                                {/* Comentarios */}
                                <td className="px-4 py-5 text-sm text-gray-500 border-r border-gray-200">
                                    {formatComments(shipment.comments)}
                                </td>
                                {/* Transportista */}
                                {(userRole === 'admin' || userRole === 'cliente') && (
                                    <td className="px-4 py-5 whitespace-nowrap text-sm border-r border-gray-200">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium truncate ${
                                            coloredRowView 
                                                ? 'bg-white/80 text-gray-800 border border-gray-300' 
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {shipment.driver_name || 'No asignado'}
                                        </span>
                                    </td>
                                )}
                                {/* Acciones */}
                                <td className="px-4 py-5 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center gap-2">
                                        <button
                                            onClick={() => onViewDetails(shipment)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                                            title="Ver detalles"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>

                                        {shipment.status === 'entregado' && userRole === 'admin' && (
                                            <button
                                                onClick={() => onShowInvoice(shipment)}
                                                className="text-gray-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-50"
                                                title="Factura"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </button>
                                        )}

                                        {userRole === 'transportista' && (
                                            <>
                                                <button
                                                    onClick={() => onUploadPOD(shipment.id)}
                                                    className="text-gray-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-50"
                                                    title="Subir POD"
                                                    disabled={uploadingId === shipment.id}
                                                >
                                                    {uploadingId === shipment.id ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />
                                                    ) : (
                                                        <Upload className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <input
                                                    id={`upload-pod-${shipment.id}`}
                                                    type="file"
                                                    accept=".pdf"
                                                    className="hidden"
                                                    onChange={(e) => handlePODUpload(e, shipment.id)}
                                                />
                                            </>
                                        )}

                                        {userRole === 'admin' && (
                                            <button
                                                onClick={() => onDelete(shipment.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Leyenda de colores cuando está activada la vista coloreada */}
            {coloredRowView && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span className="text-gray-600 font-medium">Leyenda:</span>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-yellow-300 rounded border border-yellow-400"></div>
                            <span className="text-gray-600">Pendiente</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-300 rounded border border-blue-400"></div>
                            <span className="text-gray-600">En Tránsito</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-300 rounded border border-green-400"></div>
                            <span className="text-gray-600">Entregado</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-red-300 rounded border border-red-400"></div>
                            <span className="text-gray-600">Cancelado</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShipmentTable;