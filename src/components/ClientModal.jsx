// ClientModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../services/api';

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

    // Opciones para los selectores
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

    // Estado para datos del formulario
    const [editData, setEditData] = useState(client || initialClientData);

    // Estado para errores
    const [errors, setErrors] = useState({});

    // Actualizar datos cuando cambia el cliente seleccionado
    useEffect(() => {
        if (client) {
            setEditData({ ...initialClientData, ...client });
        } else {
            setEditData({ ...initialClientData });
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
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 animate-fadeIn">
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
                  ${errors.business_name ? 'border-red-500' : 'border-gray-300'}`}
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
                  ${errors.tax_id ? 'border-red-500' : 'border-gray-300'}`}
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Persona de Contacto */}
                        <div className="space-y-4 md:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Persona de Contacto</h3>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Estado del Cliente */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Estado del cliente
                            </label>
                            <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        checked={editData.status === 'active'}
                                        onChange={() => setEditData(prev => ({ ...prev, status: 'active' }))}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2">Activo</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="inactive"
                                        checked={editData.status === 'inactive'}
                                        onChange={() => setEditData(prev => ({ ...prev, status: 'inactive' }))}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2">Inactivo</span>
                                </label>
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default ClientModal;