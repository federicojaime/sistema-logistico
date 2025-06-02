import React, { useState } from 'react';
import { FileText, Upload, Package, Mail, CheckSquare, Square, X } from 'lucide-react'; // Agregué X
import DocumentItem from '../../DocumentItem';
import EmailComposeModal from '../EmailComposeModal';

const DocumentsTab = ({
    editData,
    shipment,
    isEditing,
    userRole,
    canEdit,
    canTransportistaEdit,
    uploadingId,
    handleFileUpload,
    handleDeleteDocument,
    formatDocumentUrl
}) => {
    // Asegurar que documents sea siempre un array
    const documents = Array.isArray(editData?.documents) ? editData.documents : [];

    // Estados para la funcionalidad de email
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    // Obtener email del usuario actual
    const userEmail = JSON.parse(localStorage.getItem('currentUser'))?.email || '';

    // Manejar selección de documentos
    const handleDocumentSelect = (doc) => {
        setSelectedDocuments(prev => {
            const isSelected = prev.some(selected => selected.id === doc.id);
            if (isSelected) {
                return prev.filter(selected => selected.id !== doc.id);
            } else {
                return [...prev, doc];
            }
        });
    };

    // Seleccionar todos los documentos
    const handleSelectAll = () => {
        if (selectedDocuments.length === documents.length) {
            setSelectedDocuments([]);
        } else {
            setSelectedDocuments([...documents]);
        }
    };

    // Cancelar modo selección
    const handleCancelSelection = () => {
        setIsSelectionMode(false);
        setSelectedDocuments([]);
    };

    // Abrir modal de email
    // Abrir modal de email
    const handleOpenEmailModal = () => {
        if (selectedDocuments.length === 0) {
            alert('Por favor, seleccione al menos un documento para enviar por email.');
            return;
        }
        setIsEmailModalOpen(true);
    };

    // Cerrar modal de email
    const handleCloseEmailModal = () => {
        setIsEmailModalOpen(false);
        setIsSelectionMode(false);
        setSelectedDocuments([]);
    };

    return (
        <>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-medium flex items-center gap-2 text-gray-800">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span>Documentos</span>
                        {documents.length > 0 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                {documents.length}
                            </span>
                        )}
                    </h3>

                    <div className="flex items-center gap-2">
                        {/* Botones de selección y email */}
                        {documents.length > 0 && !isSelectionMode && (
                            <button
                                onClick={() => setIsSelectionMode(true)}
                                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 
                      transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <Mail className="w-4 h-4" />
                                Enviar por Email
                            </button>
                        )}

                        {/* Botón subir documento */}
                        {((userRole === 'admin' && canEdit(shipment)) ||
                            (userRole === 'transportista' && canTransportistaEdit(shipment))) && (
                                <button
                                    onClick={() => document.getElementById('uploadPdf').click()}
                                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 
                          transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Upload className="w-4 h-4" />
                                    Subir PDF
                                </button>
                            )}
                    </div>

                    <input
                        id="uploadPdf"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </div>

                {/* Barra de herramientas del modo selección */}
                {isSelectionMode && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-medium text-blue-800">Modo selección activo</h4>
                                </div>
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {selectedDocuments.length} seleccionados
                                </span>
                            </div>

                            <button
                                onClick={handleCancelSelection}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                                title="Cancelar selección"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-blue-700 text-sm mb-4">
                            📧 Haga clic en los documentos que desea enviar por email
                        </p>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSelectAll}
                                className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 
                      transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                {selectedDocuments.length === documents.length ? (
                                    <>
                                        <CheckSquare className="w-4 h-4" />
                                        Deseleccionar todos
                                    </>
                                ) : (
                                    <>
                                        <Square className="w-4 h-4" />
                                        Seleccionar todos
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleOpenEmailModal}
                                disabled={selectedDocuments.length === 0}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium shadow-lg"
                            >
                                <Mail className="w-4 h-4" />
                                Enviar ({selectedDocuments.length})
                            </button>
                        </div>
                    </div>
                )}

                {uploadingId === shipment.id && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
                        <p className="text-blue-700">Subiendo documento...</p>
                    </div>
                )}

                <div className="space-y-3">
                    {documents.length > 0 ? (
                        documents.map((doc, index) => {
                            const isSelected = selectedDocuments.some(selected => selected.id === doc.id);

                            return (
                                <div
                                    key={doc.id || index}
                                    className={`relative transition-all duration-200 rounded-lg ${isSelectionMode ? 'cursor-pointer hover:shadow-md' : ''
                                        } ${isSelected
                                            ? 'ring-2 ring-green-500 bg-green-50 shadow-md transform scale-[1.02]'
                                            : isSelectionMode
                                                ? 'hover:bg-gray-50 border border-gray-200'
                                                : ''
                                        }`}
                                    onClick={isSelectionMode ? () => handleDocumentSelect(doc) : undefined}
                                >
                                    {/* Checkbox de selección mejorado */}
                                    {isSelectionMode && (
                                        <div className="absolute top-3 left-3 z-10">
                                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${isSelected
                                                    ? 'bg-green-600 border-green-600 shadow-lg'
                                                    : 'bg-white border-gray-300 hover:border-green-400'
                                                }`}>
                                                {isSelected && (
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay para indicar selección */}
                                    {isSelectionMode && isSelected && (
                                        <div className="absolute inset-0 bg-green-100 bg-opacity-20 rounded-lg pointer-events-none"></div>
                                    )}

                                    <div className={isSelectionMode ? 'pl-12 pr-4 py-2' : ''}>
                                        <DocumentItem
                                            doc={doc}
                                            canEdit={
                                                !isSelectionMode && (
                                                    (userRole === 'admin' && canEdit(shipment)) ||
                                                    (userRole === 'transportista' && canTransportistaEdit(shipment))
                                                )
                                            }
                                            handleDeleteDocument={handleDeleteDocument}
                                            formatDocumentUrl={formatDocumentUrl}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No hay documentos adjuntos a este envío.</p>
                            {((userRole === 'admin' && canEdit(shipment)) ||
                                (userRole === 'transportista' && canTransportistaEdit(shipment))) && (
                                    <button
                                        onClick={() => document.getElementById('uploadPdf').click()}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Subir Documento
                                    </button>
                                )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de composición de email */}
            <EmailComposeModal
                isOpen={isEmailModalOpen}
                onClose={handleCloseEmailModal}
                shipment={shipment}
                selectedDocuments={selectedDocuments}
                userEmail={userEmail}
            />
        </>
    );
};

export default DocumentsTab;