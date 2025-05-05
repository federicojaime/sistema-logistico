import React from 'react';
import { Clipboard, Package, FileText } from 'lucide-react';

const TabNav = ({ activeTab, setActiveTab, editData }) => {
    return (
        <div className="flex items-center px-6 pt-4 border-b border-gray-100">
            <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-2 px-5 py-3 font-medium transition-all ${activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-800'}`}
            >
                <Clipboard className="w-5 h-5" />
                <span>Detalles</span>
            </button>
            <button
                onClick={() => setActiveTab('items')}
                className={`flex items-center gap-2 px-5 py-3 font-medium transition-all ${activeTab === 'items'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-800'}`}
            >
                <Package className="w-5 h-5" />
                <span>Items</span>
                {editData?.items?.length > 0 && (
                    <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full px-2 py-0.5">
                        {editData.items.length}
                    </span>
                )}
            </button>
            <button
                onClick={() => setActiveTab('documents')}
                className={`flex items-center gap-2 px-5 py-3 font-medium transition-all ${activeTab === 'documents'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-800'}`}
            >
                <FileText className="w-5 h-5" />
                <span>Documentos</span>
                {editData?.documents && editData.documents.length > 0 && (
                    <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full px-2 py-0.5">
                        {editData.documents.length}
                    </span>
                )}
            </button>
        </div>
    );
};

export default TabNav;