import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir los iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Configurar el icono por defecto para Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Función de geocodificación usando Nominatim
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'ALS-Logistics-App/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error de red: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error en geocodificación:', error);
    return [];
  }
};

// Función de geocodificación inversa
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'ALS-Logistics-App/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Error de red: ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return null;
  } catch (error) {
    console.error('Error en geocodificación inversa:', error);
    return null;
  }
};

const SimpleMapComponent = ({ initialLocation, onSelectLocation }) => {
  // Coordenadas por defecto (Miami)
  const DEFAULT_LOCATION = { 
    lat: 25.761681, 
    lng: -80.191788,
    address: ''
  };
  
  // Usar initialLocation si es válido, o DEFAULT_LOCATION
  let initialPos = DEFAULT_LOCATION;
  if (initialLocation) {
    const validLat = initialLocation.lat !== undefined && 
                    initialLocation.lat !== null && 
                    !isNaN(Number(initialLocation.lat));
    
    const validLng = initialLocation.lng !== undefined && 
                    initialLocation.lng !== null && 
                    !isNaN(Number(initialLocation.lng));
    
    if (validLat && validLng) {
      initialPos = {
        lat: Number(initialLocation.lat),
        lng: Number(initialLocation.lng),
        address: initialLocation.address || ''
      };
    } else if (initialLocation.address) {
      initialPos = {
        ...DEFAULT_LOCATION,
        address: initialLocation.address
      };
    }
  }
  
  const [position, setPosition] = useState({
    lat: initialPos.lat,
    lng: initialPos.lng
  });
  const [address, setAddress] = useState(initialPos.address || '');
  const [searchText, setSearchText] = useState(initialPos.address || '');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mapContainerIdRef = useRef(`map-${Math.random().toString(36).substring(2, 11)}`);

  // Función para obtener sugerencias
  const getSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const results = await geocodeAddress(query);
      setSearchResults(results.slice(0, 5));
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setIsUserTyping(true);
    setError('');

    // Cancelar timeouts anteriores
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Obtener sugerencias con debounce
    if (value.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        getSuggestions(value);
      }, 400);
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }

    // Marcar que ya no está escribiendo después de un tiempo
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
    }, 2000);
  };

  // Seleccionar una sugerencia
  const selectSuggestion = (result) => {
    const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    
    setPosition(newPos);
    setAddress(result.display_name);
    setSearchText(result.display_name);
    setSearchResults([]);
    setShowSuggestions(false);
    setIsUserTyping(false);
    
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([newPos.lat, newPos.lng]);
      mapRef.current.setView([newPos.lat, newPos.lng], 15);
    }
  };

  // Inicializar el mapa
  useEffect(() => {
    const mapContainerId = mapContainerIdRef.current;
    
    const container = document.getElementById(mapContainerId);
    if (!container) {
      console.error(`El contenedor con ID ${mapContainerId} no existe`);
      return;
    }

    // Si ya existe un mapa, no crear otro
    if (mapRef.current) {
      return;
    }
    
    try {
      const map = L.map(mapContainerId, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([position.lat, position.lng], 13);
      mapRef.current = map;
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      const marker = L.marker([position.lat, position.lng], { draggable: true }).addTo(map);
      markerRef.current = marker;
      
      // Manejar arrastre del marcador
      marker.on('dragend', async function(e) {
        if (isUserTyping) return;
        
        const pos = e.target.getLatLng();
        setPosition({ lat: pos.lat, lng: pos.lng });
        
        try {
          const addressResult = await reverseGeocode(pos.lat, pos.lng);
          if (addressResult) {
            setAddress(addressResult);
          } else {
            setAddress(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
          }
        } catch (err) {
          console.error('Error en geocodificación inversa:', err);
          setAddress(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
        }
      });
      
      // Manejar clic en el mapa
      map.on('click', async function(e) {
        if (isUserTyping) return;
        
        const pos = e.latlng;
        marker.setLatLng(pos);
        setPosition({ lat: pos.lat, lng: pos.lng });
        
        try {
          const addressResult = await reverseGeocode(pos.lat, pos.lng);
          if (addressResult) {
            setAddress(addressResult);
          } else {
            setAddress(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
          }
        } catch (err) {
          console.error('Error en geocodificación inversa:', err);
          setAddress(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
        }
        
        setShowSuggestions(false);
      });
      
      // Si hay una dirección inicial pero no coordenadas, geocodificar
      if (initialPos.address && (!initialPos.lat || !initialPos.lng)) {
        (async () => {
          try {
            const results = await geocodeAddress(initialPos.address);
            if (results && results.length > 0) {
              const result = results[0];
              const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
              setPosition(newPos);
              marker.setLatLng([newPos.lat, newPos.lng]);
              map.setView([newPos.lat, newPos.lng], 15);
            }
          } catch (err) {
            console.error('Error al geocodificar dirección inicial:', err);
          }
        })();
      }
    } catch (err) {
      console.error('Error al inicializar el mapa:', err);
      setError('Error al inicializar el mapa. Intente nuevamente más tarde.');
    }
    
    // Limpiar al desmontar
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Ocultar sugerencias cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Manejar búsqueda manual
  const handleManualSearch = async () => {
    if (!searchText.trim()) return;
    
    setLoading(true);
    setError('');
    setShowSuggestions(false);
    setIsUserTyping(false);
    
    try {
      const results = await geocodeAddress(searchText);
      
      if (results && results.length > 0) {
        const result = results[0];
        const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        
        setPosition(newPos);
        setAddress(result.display_name);
        setSearchText(result.display_name);
        
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([newPos.lat, newPos.lng]);
          mapRef.current.setView([newPos.lat, newPos.lng], 15);
        }
      } else {
        setError('No se encontró la dirección. Intente con otra búsqueda o seleccione directamente en el mapa.');
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al buscar la dirección. Intente más tarde o seleccione directamente en el mapa.');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar teclas en el campo de búsqueda
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      handleManualSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Manejar foco en el campo
  const handleFocus = () => {
    setIsUserTyping(true);
    if (searchText.length >= 3 && searchResults.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Manejar pérdida de foco
  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };
  
  // Confirmar ubicación
  const handleConfirmLocation = () => {
    onSelectLocation({
      lat: position.lat,
      lng: position.lng,
      address: address || `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`
    });
  };
  
  return (
    <div className="flex flex-col gap-4">
      {/* Contenedor de búsqueda con z-index alto */}
      <div className="search-container relative" style={{ zIndex: 1000 }}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar dirección (ej: San Luis 1234, Argentina)"
              value={searchText}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoComplete="off"
            />
            
            {/* Lista de sugerencias con z-index muy alto */}
            {showSuggestions && searchResults.length > 0 && (
              <div 
                className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto"
                style={{ zIndex: 9999 }}
              >
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.place_id || index}`}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(result);
                    }}
                  >
                    <div className="text-sm font-medium text-gray-800">
                      {result.display_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {result.type && `${result.type} • `}
                      {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleManualSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded">
          {error}
        </div>
      )}
      
      {/* Contenedor del mapa con z-index bajo */}
      <div
        id={mapContainerIdRef.current}
        className="w-full rounded-lg border border-gray-300"
        style={{ height: '300px', zIndex: 1 }}
      ></div>
      
      <div className="text-xs text-gray-500 italic">
        Escribe una dirección para ver sugerencias, selecciona una sugerencia, presiona Enter para buscar, o haz clic directamente en el mapa.
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold">Latitud:</p>
            <p className="text-sm">{typeof position.lat === 'number' ? position.lat.toFixed(6) : 'No disponible'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Longitud:</p>
            <p className="text-sm">{typeof position.lng === 'number' ? position.lng.toFixed(6) : 'No disponible'}</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm font-semibold">Dirección encontrada:</p>
          <p className="text-sm break-words">{address || 'No disponible'}</p>
        </div>
      </div>
      
      <div className="flex justify-end mt-2">
        <button
          onClick={handleConfirmLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Confirmar ubicación
        </button>
      </div>
    </div>
  );
};

export default SimpleMapComponent;