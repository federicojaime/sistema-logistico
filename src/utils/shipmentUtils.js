// Mapeo de estados (clave en API a valor mostrado)
export const statusMap = {
    'pendiente': 'Pendiente',
    'en_transito': 'En tránsito',
    'entregado': 'Entregado',
    'cancelado': 'Cancelado'
};

// Mapeo de estados (valor mostrado a clave en API)
export const reverseStatusMap = {
    'Pendiente': 'pendiente',
    'En tránsito': 'en_transito',
    'Entregado': 'entregado',
    'Cancelado': 'cancelado'
};

// Colores para los estados de envío
export const statusColors = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'En tránsito': 'bg-blue-100 text-blue-800',
    'Entregado': 'bg-green-100 text-green-800',
    'Cancelado': 'bg-red-100 text-red-800'
};

// Función para el ordenamiento de envíos
export const sortShipments = (shipments, isTransportista) => {
    // Orden de prioridad para transportistas: pendiente > en_transito > entregado > cancelado
    const statusPriority = {
        'pendiente': 0,
        'en_transito': 1,
        'entregado': 2,
        'cancelado': 3
    };

    return [...shipments].sort((a, b) => {
        // Para transportistas, ordenar primero por estado
        if (isTransportista) {
            if (statusPriority[a.status] !== statusPriority[b.status]) {
                return statusPriority[a.status] - statusPriority[b.status];
            }
        }

        // Ordenar por ID (más nuevos primero)
        return b.id - a.id;
    });
};

// Función para verificar si un envío puede ser editado
export const canEdit = (shipment, userRole) => {
    if (!shipment) return false;
    // Permitir a los administradores editar cualquier envío, independientemente del estado
    if (userRole === 'admin') return true;
    // Para otros roles, mantener la restricción
    return shipment.status !== 'entregado' && shipment.status !== 'cancelado';
};

// Verificar si el transportista puede editar este envío
export const canTransportistaEdit = (shipment, userRole) => {
    if (userRole !== 'transportista') return canEdit(shipment, userRole);
    return canEdit(shipment, userRole);
};

// Verificar si se puede mostrar la factura
export const canShowInvoice = (shipment, userRole) => {
    return userRole === 'admin' && shipment.status === 'entregado';
};

// Función para formatear el costo de envío correctamente
export const formatShippingCost = (cost) => {
    // Asegurarse que el costo sea un número
    const numericCost = typeof cost === 'string' ? parseFloat(cost) : (typeof cost === 'number' ? cost : 0);
    return isNaN(numericCost) ? '0.00' : numericCost.toFixed(2);
};

// Formatear fecha para mostrar
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};