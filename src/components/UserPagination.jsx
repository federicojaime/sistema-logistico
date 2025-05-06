// src/components/UserPagination.jsx
import React from 'react';

const UserPagination = ({ currentPage, totalPages, setCurrentPage }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center mt-6">
            <div className="flex rounded-md shadow-sm -space-x-px">
                <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <span className="sr-only">Primera</span>
                    <span className="text-xs">«</span>
                </button>

                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <span className="sr-only">Anterior</span>
                    <span className="text-xs">‹</span>
                </button>

                {/* Números de página */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <span className="sr-only">Siguiente</span>
                    <span className="text-xs">›</span>
                </button>

                <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                >
                    <span className="sr-only">Última</span>
                    <span className="text-xs">»</span>
                </button>
            </div>
        </div>
    );
};

export default UserPagination;