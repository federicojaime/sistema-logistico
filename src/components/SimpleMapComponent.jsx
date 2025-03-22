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

// Lista de ubicaciones comunes para facilitar la búsqueda
const COMMON_LOCATIONS = [
  { name: "Miami, Florida, USA", lat: 25.761681, lng: -80.191788 },
  { name: "New York, NY, USA", lat: 40.712776, lng: -74.005974 },
  { name: "Los Angeles, CA, USA", lat: 34.052235, lng: -118.243683 },
  { name: "Houston, TX, USA", lat: 29.760427, lng: -95.369803 },
  { name: "Chicago, IL, USA", lat: 41.878113, lng: -87.629799 },
  { name: "Miami Airport, FL, USA", lat: 25.795865, lng: -80.287046 },
  { name: "Port Miami, FL, USA", lat: 25.774948, lng: -80.176567 },
  { name: "Orlando, FL, USA", lat: 28.538336, lng: -81.379234 },
  { name: "Tampa, FL, USA", lat: 27.950575, lng: -82.457178 },
  { name: "Jacksonville, FL, USA", lat: 30.332184, lng: -81.655647 }
];

const SimpleMapComponent = ({ initialLocation, onSelectLocation }) => {
  // Coordenadas por defecto para Miami
  const DEFAULT_LOCATION = { 
    lat: 25.761681, 
    lng: -80.191788,
    address: "Miami, Florida, USA"
  };

  // Configuración inicial con valores por defecto o proporcionados
  const initialPos = initialLocation || DEFAULT_LOCATION;
  
  const [position, setPosition] = useState({
    lat: initialPos.lat || DEFAULT_LOCATION.lat,
    lng: initialPos.lng || DEFAULT_LOCATION.lng
  });
  const [address, setAddress] = useState(initialPos.address || '');
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerId = `map-${Date.now()}`;
  
  // Inicializar mapa
  useEffect(() => {
    // Crear mapa
    const map = L.map(mapContainerId).setView([position.lat, position.lng], 13);
    mapRef.current = map;
    
    // Añadir capa de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Añadir marcador
    const marker = L.marker([position.lat, position.lng], { draggable: true }).addTo(map);
    markerRef.current = marker;
    
    // Manejar arrastre del marcador
    marker.on('dragend', function(e) {
      const pos = e.target.getLatLng();
      setPosition({ lat: pos.lat, lng: pos.lng });
      reverseGeocode(pos.lat, pos.lng);
    });
    
    // Manejar clic en el mapa
    map.on('click', function(e) {
      const { lat, lng } = e.latlng;
      
      setPosition({ lat, lng });
      marker.setLatLng([lat, lng]);
      reverseGeocode(lat, lng);
    });
    
    // Geocodificación inversa para obtener dirección a partir de coordenadas
    const reverseGeocode = async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`,
          { headers: { 'User-Agent': 'ALS-Logistics-App' } }
        );
        
        if (!response.ok) {
          throw new Error('Error en geocodificación inversa');
        }
        
        const data = await response.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      } catch (error) {
        console.error('Error:', error);
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    };
    
    // Intentar obtener dirección inicial si no está disponible
    if (!address && initialPos) {
      reverseGeocode(initialPos.lat, initialPos.lng);
    }
    
    // Limpiar al desmontar
    return () => {
      map.remove();
    };
  }, []);

  // Filtrar sugerencias basadas en el texto de búsqueda
  const filterSuggestions = (text) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const filtered = COMMON_LOCATIONS.filter(location => 
      location.name.toLowerCase().includes(text.toLowerCase())
    );
    
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  // Manejar cambios en el campo de búsqueda
  const handleSearchChange = (e) => {
    const text = e.target.value;
    setSearchText(text);
    filterSuggestions(text);
  };

  // Seleccionar ubicación desde las sugerencias
  const selectLocation = (location) => {
    setPosition({ lat: location.lat, lng: location.lng });
    setAddress(location.name);
    setSearchText(location.name);
    setShowSuggestions(false);
    
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lng]);
      mapRef.current.setView([location.lat, location.lng], 13);
    }
  };

  // Buscar dirección ingresada manualmente
  const searchAddress = async () => {
    if (!searchText || searchText.trim().length < 3) {
      setError('Por favor ingrese una dirección más específica');
      return;
    }
    
    setError('');
    
    // Primero buscar en ubicaciones comunes
    const localMatch = COMMON_LOCATIONS.find(loc => 
      loc.name.toLowerCase().includes(searchText.toLowerCase())
    );
    
    if (localMatch) {
      selectLocation(localMatch);
      return;
    }
    
    // Si no se encuentra localmente, usar la API de geocodificación
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1&accept-language=es`,
        { headers: { 'User-Agent': 'ALS-Logistics-App' } }
      );
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          name: result.display_name
        };
        
        selectLocation(location);
      } else {
        setError('No se encontraron resultados para esta dirección');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al buscar la dirección. Intente con otra o seleccione directamente en el mapa.');
    }
  };

  // Manejar tecla Enter en el campo de búsqueda
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchAddress();
    }
  };

  // Confirmar la ubicación seleccionada
  const handleConfirmLocation = () => {
    onSelectLocation({
      lat: position.lat,
      lng: position.lng,
      address: address
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar dirección (ej: Miami, Florida)..."
            value={searchText}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            onFocus={() => filterSuggestions(searchText)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          <button
            onClick={searchAddress}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm mt-1">
            {error}
          </div>
        )}
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((location, index) => (
              <div 
                key={index}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectLocation(location)}
              >
                {location.name}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div
        id={mapContainerId}
        className="w-full rounded-lg border border-gray-300"
        style={{ height: '300px' }}
      ></div>
      
      <div className="text-xs text-gray-500 italic">
        Busca una dirección usando el campo de arriba o haz clic directamente en cualquier punto del mapa.
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold">Latitud:</p>
            <p className="text-sm">{position.lat.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Longitud:</p>
            <p className="text-sm">{position.lng.toFixed(6)}</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm font-semibold">Dirección:</p>
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