// ClientPagination.jsx
import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';

const ClientPagination = ({ currentPage, totalPages, onPageChange }) => {
    // Función para generar el rango de páginas a mostrar
    const getPageRange = () => {
        // Mostrar 5 páginas como máximo
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Si estamos en las primeras 3 páginas
        if (currentPage <= 3) {
            return [1, 2, 3, 4, 5];
        }

        // Si estamos en las últimas 3 páginas
        if (currentPage >= totalPages - 2) {
            return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        // En cualquier otro caso, mostrar 2 páginas antes y 2 después
        return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    };

    const pageRange = getPageRange();

    return (
        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-lg">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {/* Primera página */}
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <span className="sr-only">Primera página</span>
                            <ChevronsLeft className="h-5 w-5" />
                        </button>

                        {/* Página anterior */}
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <span className="sr-only">Anterior</span>
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Números de página */}
                        {pageRange.map(page => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border ${currentPage === page
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    } text-sm font-medium`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Página siguiente */}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <span className="sr-only">Siguiente</span>
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        {/* Última página */}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <span className="sr-only">Última página</span>
                            <ChevronsRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            </div>

            {/* Versión móvil simplificada */}
            <div className="flex items-center justify-between w-full sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Anterior
                </button>
                <div className="text-sm text-gray-700">
                    <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                </div>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default ClientPagination;