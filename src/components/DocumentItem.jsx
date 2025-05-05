// En el DocumentItem.jsx
import React from 'react';
import { Eye, Download, Trash2 } from 'lucide-react';

const DocumentItem = ({ doc, canEdit, handleDeleteDocument, formatDocumentUrl }) => {
    // Verificar que el documento tenga propiedades válidas
    if (!doc || (!doc.name && !doc.file_content && !doc.path && !doc.url)) {
        return null;
    }

    // Obtener una URL válida para el documento
    const getDocumentUrl = () => {
        const content = doc.file_content || doc.path || doc.url || '';

        // Si la función formatDocumentUrl está disponible, usarla
        if (typeof formatDocumentUrl === 'function') {
            return formatDocumentUrl(content);
        }

        // Si no hay función, hacer el formato básico
        if (!content) return '#';
        if (content.startsWith('http')) return content;

        // Formar URL con el API base
        const baseUrl = import.meta.env.VITE_API_URL;
        const path = content.startsWith('/') ? content.substring(1) : content;
        return `${baseUrl}/${path}`;
    };

    const documentUrl = getDocumentUrl();

    return (
        <div
            className="flex items-center justify-between bg-gray-50 p-4 rounded-lg 
            hover:bg-blue-50/30 transition-colors border border-gray-100"
        >
            <span className="text-sm flex-1 font-medium truncate">{doc.name || 'Documento'}</span>
            <div className="flex gap-3">
                <button
                    onClick={() => window.open(documentUrl, '_blank')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    disabled={documentUrl === '#'}
                >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Ver</span>
                </button>

                <a
                    href={documentUrl}
                    download
                    className="text-green-600 hover:text-green-800 flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
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