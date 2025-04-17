import React, { useState, useEffect, useRef } from 'react';
import { Plus, ChevronDown, X, Check } from 'lucide-react';
import api from '../services/api';

const DescriptionAutocomplete = ({ value, onChange, placeholder = "Descripción" }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  
  const wrapperRef = useRef(null);
  
  // Cargar descripciones desde la API
  useEffect(() => {
    const fetchDescriptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/item-descriptions');
        
        if (response && Array.isArray(response.data)) {
          setOptions(response.data);
          setFilteredOptions(response.data);
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      } catch (err) {
        console.error('Error al cargar descripciones:', err);
        setError('No se pudieron cargar las descripciones');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDescriptions();
  }, []);
  
  // Filtrar opciones basado en el texto ingresado
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => 
        option.description.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [inputValue, options]);
  
  // Detectar clics fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsAddingNew(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Manejar selección de una opción
  const handleSelect = (option) => {
    setInputValue(option.description);
    onChange(option.description);
    setIsOpen(false);
  };
  
  // Manejar cambio en el input
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };
  
  // Agregar nueva descripción
  const handleAddNew = async () => {
    if (!newDescription.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/item-description', { 
        description: newDescription 
      });
      
      if (response) {
        // Recargar las descripciones para obtener la nueva con su ID
        const descriptionsResponse = await api.get('/item-descriptions');
        if (descriptionsResponse && Array.isArray(descriptionsResponse.data)) {
          setOptions(descriptionsResponse.data);
        }
        
        // Seleccionar la descripción recién agregada
        setInputValue(newDescription);
        onChange(newDescription);
        
        setNewDescription('');
        setIsAddingNew(false);
      }
    } catch (err) {
      console.error('Error al agregar descripción:', err);
      setError('No se pudo agregar la descripción');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Eliminar una descripción
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Evitar que se seleccione al hacer clic en eliminar
    
    try {
      setIsLoading(true);
      setError(null);
      
      await api.delete(`/item-description/${id}`);
      
      // Eliminar la opción del estado local
      setOptions(prevOptions => prevOptions.filter(option => option.id !== id));
    } catch (err) {
      console.error('Error al eliminar descripción:', err);
      setError('No se pudo eliminar la descripción');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-2 text-center text-gray-500">Cargando...</div>
          ) : (
            <>
              {filteredOptions.length > 0 ? (
                <ul>
                  {filteredOptions.map((option) => (
                    <li
                      key={option.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                      onClick={() => handleSelect(option)}
                    >
                      <span>{option.description}</span>
                      {/* Solo permitir eliminar si no es predefinido (is_default = 0) */}
                      {option.is_default === 0 && (
                        <button
                          onClick={(e) => handleDelete(option.id, e)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-2 text-center text-gray-500">
                  No hay coincidencias
                </div>
              )}
              
              {/* Agregar nueva descripción */}
              {isAddingNew ? (
                <div className="p-2 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-2 py-1 border rounded"
                      placeholder="Nueva descripción"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                      autoFocus
                    />
                    <button
                      onClick={handleAddNew}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      disabled={isLoading}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="px-3 py-2 border-t text-blue-600 hover:bg-blue-50 cursor-pointer flex items-center gap-1"
                  onClick={() => setIsAddingNew(true)}
                >
                  <Plus className="w-4 h-4" /> Añadir nueva descripción
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DescriptionAutocomplete;