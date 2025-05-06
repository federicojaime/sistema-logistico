// src/components/UserSearch.jsx
import React from 'react';
import { Search, X } from 'lucide-react';

const UserSearch = ({ searchQuery, setSearchQuery, clearSearch }) => {
    return (
        <div className="mb-6 relative">
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-3 py-2 text-gray-400">
                    <Search className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    className="flex-1 py-2 px-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700"
                    placeholder="Buscar por nombre, email o rol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button
                        onClick={clearSearch}
                        className="px-3 py-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserSearch;