// src/components/shipment-creation/components/DocumentsStep.jsx
import React from 'react';
import { Upload, File, Trash2, Eye, FileText } from 'lucide-react';

const DocumentsStep = ({ shipment, setShipment }) => {
    // Manejar la subida de documentos
    const handleFileUpload = (e) => {
        if (e.target.files?.length > 0) {
            const file = e.target.files[0];

            // Validar tipo de archivo
            if (file.type !== 'application/pdf') {
                alert('Solo se permiten archivos PDF');
                return;
            }

            // Validar tamaño (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 5MB.');
                return;
            }

            setShipment(prev => ({
                ...prev,
                pdfs: [...prev.pdfs, file]
            }));

            // Limpiar el input para permitir subir el mismo archivo nuevamente
            e.target.value = '';
        }
    };

    // Eliminar documento
    const handleRemoveFile = (index) => {
        setShipment(prev => ({
            ...prev,
            pdfs: prev.pdfs.filter((_, i) => i !== index)
        }));
    };

    // Ver documento
    const handleViewFile = (file) => {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Documentos</h2>
                <p className="text-sm text-gray-600">Añade documentos relacionados con este envío (opcional).</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="space-y-6">
                    {/* Información sobre límites */}
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Máximo 5 archivos PDF (5MB por archivo)
                        </p>
                        <p className="text-sm text-gray-600">
                            {shipment.pdfs.length}/5 archivos
                        </p>
                    </div>

                    {/* Botón para subir documento */}
                    {shipment.pdfs.length < 5 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 mb-4">
                                Arrastra y suelta un archivo PDF aquí, o haz clic para seleccionarlo
                            </p>
                            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                                <Upload className="w-5 h-5 mr-2" />
                                Seleccionar PDF
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}

                    {/* Lista de documentos */}
                    {shipment.pdfs.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-medium text-gray-800 mb-3">Documentos subidos</h3>
                            <div className="space-y-2">
                                {shipment.pdfs.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <File className="w-5 h-5 text-blue-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {(file.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleViewFile(file)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Ver documento"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(index)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar documento"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mensaje cuando no hay documentos */}
                    {shipment.pdfs.length === 0 && (
                        <div className="mt-4 text-center text-sm text-gray-500">
                            No se han subido documentos para este envío
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-700">
                    <strong>Nota:</strong> Los documentos no son obligatorios para crear el envío. Podrás añadir documentos adicionales más adelante.
                </p>
            </div>
        </div>
    );
};

export default DocumentsStep;