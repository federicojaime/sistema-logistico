// src/components/SubClientModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Users } from 'lucide-react';
import api from '../services/api';

const SubClientModal = ({ clientId, subClient, onClose }) => {
    const isEditing = !!subClient;

    const [formData, setFormData] = useState({
        name: '',
        business_name: '',
        tax_id: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Inicializar el formulario con los datos del sub cliente si está editando
    useEffect(() => {
        if (subClient) {
            setFormData({
                name: subClient.name || '',
                business_name: subClient.business_name || '',
                tax_id: subClient.tax_id || '',
                email: subClient.email || '',
                phone: subClient.phone || '',
                address: subClient.address || '',
                notes: subClient.notes || ''
            });
        }
    }, [subClient]);

    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Validar formulario antes de enviar
    const validateForm = () => {
        if (!formData.name.trim() && !formData.business_name.trim()) {
            setError('Debe proporcionar un nombre o nombre de negocio');
            return false;
        }
        return true;
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let response;

            if (isEditing) {
                // Actualizar sub cliente existente
                response = await api.put(`/clients/${clientId}/subclients/${subClient.id}`, formData);
            } else {
                // Crear nuevo sub cliente
                response = await api.post(`/clients/${clientId}/subclients`, formData);
            }

            if (response) {
                onClose(true); // Cerrar modal y refrescar la lista
            } else {
                throw new Error('No se recibió respuesta del servidor');
            }
        } catch (err) {
            console.error('Error al guardar sub cliente:', err);
            setError(`Error al ${isEditing ? 'actualizar' : 'crear'} sub cliente: ${err.message || 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-600" />
                        <span>{isEditing ? 'Editar Sub Cliente' : 'Nuevo Sub Cliente'}</span>
                    </h2>
                    <button
                        onClick={() => onClose(false)}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-all duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nombre del sub cliente"
                            />
                        </div>

                        {/* Nombre Comercial */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                            <input
                                type="text"
                                name="business_name"
                                value={formData.business_name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nombre de la empresa"
                            />
                        </div>

                        {/* CUIT/NIT */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CUIT/NIT</label>
                            <input
                                type="text"
                                name="tax_id"
                                value={formData.tax_id}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Número de identificación fiscal"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Correo electrónico"
                            />
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Número de teléfono"
                            />
                        </div>

                        {/* Dirección */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Dirección física"
                            />
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="col-span-1 md:col-span-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Notas adicionales sobre el sub cliente"
                        ></textarea>
                    </div>