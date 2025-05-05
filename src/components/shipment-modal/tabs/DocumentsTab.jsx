import React from 'react';
import { FileText, Upload, Package } from 'lucide-react';
import DocumentItem from '../../DocumentItem';

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
    const documents = editData?.documents || [];

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-medium flex items-center gap-2 text-gray-800">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Documentos</span>
                </h3>
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
                <input
                    id="uploadPdf"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                />
            </div>

            {uploadingId === shipment.id && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
                    <p className="text-blue-700">Subiendo documento...</p>
                </div>
            )}

            <div className="space-y-3">
                {documents.length > 0 ? (
                    documents.map((doc, index) => (
                        <DocumentItem
                            key={index}
                            doc={doc}
                            canEdit={
                                (userRole === 'admin' && canEdit(shipment)) ||
                                (userRole === 'transportista' && canTransportistaEdit(shipment))
                            }
                            handleDeleteDocument={handleDeleteDocument}
                            formatDocumentUrl={formatDocumentUrl}
                        />
                    ))
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
    );
};

export default DocumentsTab;