import React from 'react';
import { Eye, Download, Trash2 } from 'lucide-react';

const DocumentItem = ({ doc, canEdit, handleDeleteDocument, formatDocumentUrl }) => {
    return (
        <div
            className="flex items-center justify-between bg-gray-50 p-4 rounded-lg 
      hover:bg-blue-50/30 transition-colors border border-gray-100"
        >
            <span className="text-sm flex-1 font-medium truncate">{doc.name}</span>
            <div className="flex gap-3">
                <button
                    onClick={() => window.open(formatDocumentUrl(doc.file_content), '_blank')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Ver</span>
                </button>

                <a
                    href={formatDocumentUrl(doc.file_content)}
                    download
                    className="text-green-600 hover:text-green-800 flex items-center gap-1"
                >
                    <Download className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Descargar</span>
                </a>

                {canEdit && (
                    <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm hidden sm:inline">Eliminar</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default DocumentItem;