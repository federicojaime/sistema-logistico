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

// Coordenadas por defecto para Miami, FL - usadas solo si no hay ubicación inicial
const DEFAULT_LOCATION = { 
  lat: 25.761681, 
  lng: -80.191788,
  address: "Miami, Florida, United States"
};

// Ejemplos de ubicaciones predefinidas para búsqueda rápida
// Esto sirve como fallback cuando la API de búsqueda no responde
const FALLBACK_LOCATIONS = [
  { 
    display_name: "San Luis, Argentina", 
    lat: -33.295555, 
    lon: -66.338022
  },
  { 
    display_name: "San Luis Potosí, México", 
    lat: 22.156469, 
    lon: -100.985662
  },
  { 
    display_name: "San Luis Obispo, California, Estados Unidos", 
    lat: 35.282752, 
    lon: -120.659616
  },
  { 
    display_name: "Miami, Florida, Estados Unidos", 
    lat: 25.761681, 
    lon: -80.191788
  },
  { 
    display_name: "Nueva York, Estados Unidos", 
    lat: 40.712776, 
    lon: -74.005974
  }
];

const SimpleMapComponent = ({ initialLocation, onSelectLocation }) => {
  // Usar initialLocation si se proporciona, de lo contrario usar los valores por defecto
  const initialPos = initialLocation || DEFAULT_LOCATION;
  
  // Si tenemos coordenadas de la ubicación inicial, priorizar esas
  const startPosition = {
    lat: initialPos.lat || DEFAULT_LOCATION.lat,
    lng: initialPos.lng || DEFAULT_LOCATION.lng
  };

  const [searchText, setSearchText] = useState('');
  const [address, setAddress] = useState(initialPos.address || DEFAULT_LOCATION.address);
  const [position, setPosition] = useState(startPosition);
  const [suggestions, setSuggestions] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchError, setSearchError] = useState(false);
  
  const mapContainerId = `map-${Math.random().toString(36).substring(2, 11)}`;
  
  // Referencias para mapa y marcador
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Inicializar el mapa cuando el componente se monta
  useEffect(() => {
    console.log("Initializing map with position:", startPosition);
    
    // Crear una instancia del mapa
    const map = L.map(mapContainerId).setView(
      [position.lat, position.lng], 
      13
    );
    
    // Guardar referencia al mapa
    mapRef.current = map;

    // Añadir el tile layer de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Añadir un marcador inicial arrastrable
    const marker = L.marker([position.lat, position.lng], {
      draggable: true  // Hacer el marcador arrastrable
    }).addTo(map);
    
    markerRef.current = marker;

    // Evento cuando comienza a arrastrar el marcador
    marker.on('dragstart', function() {
      setIsDragging(true);
    });

    // Evento cuando el marcador termina de arrastrarse
    marker.on('dragend', function(e) {
      const newPos = e.target.getLatLng();
      const newPosition = { lat: newPos.lat, lng: newPos.lng };
      setPosition(newPosition);
      
      // Geocodificar la nueva posición después de un pequeño retraso
      setTimeout(() => {
        reverseGeocode(newPosition);
        setIsDragging(false);
      }, 300);
    });

    // Manejar clics en el mapa
    map.on('click', function(e) {
      const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPosition);
      
      // Actualizar el marcador si existe
      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      }
      
      // Intentar geocodificar la posición
      reverseGeocode(newPosition);
    });

    // Función sencilla de geocodificación inversa usando Nominatim
    const reverseGeocode = async (pos) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&zoom=18&addressdetails=1`,
          { 
            headers: { 
              'Accept-Language': 'es',
              'User-Agent': 'ALS-Logistica/1.0'
            } 
          }
        );
        
        if (!response.ok) {
          throw new Error(`Error de red: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.display_name) {
          setAddress(data.display_name);
          if (!isDragging) {
            setSearchText(data.display_name);
          }
        }
      } catch (error) {
        console.error("Error en geocodificación inversa:", error);
        // Mantenemos la dirección anterior en caso de error
      }
    };

    // Geocodificar la posición inicial solo si no tenemos dirección
    if (!initialPos.address && !initialPos.direccionOrigen && !initialPos.direccionDestino) {
      reverseGeocode(position);
    }

    // Limpiar al desmontar
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [mapContainerId]); // Solo ejecutar cuando cambia el ID del contenedor

  // Búsqueda en modo local (fallback)
  const searchLocalSuggestions = (text) => {
    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    
    const query = text.toLowerCase();
    const filteredLocations = FALLBACK_LOCATIONS.filter(location => 
      location.display_name.toLowerCase().includes(query)
    );
    
    setSuggestions(filteredLocations);
    setSearchError(false);
  };

  // Función para buscar sugerencias mientras se escribe
  const searchSuggestions = async (text) => {
    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    
    // Primero mostramos resultados locales mientras esperamos la API
    searchLocalSuggestions(text);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos timeout
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`,
        { 
          headers: { 
            'Accept-Language': 'es',
            'User-Agent': 'ALS-Logistica/1.0'
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSuggestions(data);
        setSearchError(false);
      } else {
        // Si no hay resultados, volvemos a los resultados locales
        searchLocalSuggestions(text);
      }
    } catch (error) {
      console.error("Error buscando sugerencias:", error);
      // En caso de error, usar las ubicaciones predefinidas como fallback
      searchLocalSuggestions(text);
      setSearchError(true);
    }
  };

  // Manejar cambios en el campo de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    // Buscar después de un breve retraso para evitar demasiadas solicitudes
    if (value.length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        searchSuggestions(value);
      }, 300);
      
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestions([]);
    }
  };

  // Función para seleccionar una sugerencia
  const selectSuggestion = (suggestion) => {
    const newPos = { 
      lat: parseFloat(suggestion.lat), 
      lng: parseFloat(suggestion.lon) 
    };
    
    setPosition(newPos);
    setSearchText(suggestion.display_name);
    setAddress(suggestion.display_name);
    setSuggestions([]);
    
    // Actualizar el mapa y el marcador
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([newPos.lat, newPos.lng]);
      mapRef.current.flyTo([newPos.lat, newPos.lng], 15);
    }
  };

  // Función de búsqueda de dirección con el botón
  const geocodeAddress = async () => {
    if (!searchText || !searchText.trim() || !mapRef.current) return;

    // Primero verificamos si coincide con alguna de nuestras ubicaciones predefinidas
    const matchedLocation = FALLBACK_LOCATIONS.find(loc => 
      loc.display_name.toLowerCase().includes(searchText.toLowerCase())
    );
    
    if (matchedLocation) {
      selectSuggestion(matchedLocation);
      return;
    }
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`,
        { 
          headers: { 
            'Accept-Language': 'es',
            'User-Agent': 'ALS-Logistica/1.0'
          } 
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        selectSuggestion(result);
      } else {
        // Si no hay resultados, mostrar mensaje
        alert("No se encontraron resultados para esta dirección");
      }
    } catch (error) {
      console.error("Error en geocodificación:", error);
      
      // Intentar buscar en las ubicaciones locales como fallback
      const matchedLocation = FALLBACK_LOCATIONS.find(loc => 
        loc.display_name.toLowerCase().includes(searchText.toLowerCase())
      );
      
      if (matchedLocation) {
        selectSuggestion(matchedLocation);
      } else {
        alert("Error al buscar la dirección. Por favor intente nuevamente.");
      }
    }
  };

  // Manejar la selección de ubicación
  const handleSelectLocation = () => {
    if (position) {
      onSelectLocation({
        lat: position.lat,
        lng: position.lng,
        address: address || 'Ubicación sin dirección'
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <div className="flex gap-2">
          <input
            ref={searchInputRef}
            type="text"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresar dirección"
            value={searchText}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchText.trim().length >= 2) {
                searchSuggestions(searchText);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                geocodeAddress();
              }
            }}
            autoComplete="off" // Deshabilitar el autocompletado del navegador
          />
          <button
            type="button"
            onClick={geocodeAddress}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </div>
        
        {/* Lista de sugerencias */}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white mt-1 border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchError && (
              <li className="px-4 py-2 text-sm text-orange-700 bg-orange-50">
                Usando resultados locales - API no disponible
              </li>
            )}
            {suggestions.map((suggestion, index) => (
              <li 
                key={`suggestion-${index}`}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div 
        id={mapContainerId} 
        className="h-64 rounded-lg border"
        style={{ height: '300px', width: '100%' }}
      ></div>

      <div className="mt-2 text-sm text-gray-600 mb-2">
        <p className="text-xs text-gray-500 mb-2 italic">Para mover el marcador: haz clic en un punto del mapa o arrastra el pin a la ubicación deseada.</p>
        <p><strong>Latitud:</strong> {Number(position.lat).toFixed(6)}</p>
        <p><strong>Longitud:</strong> {Number(position.lng).toFixed(6)}</p>
        <p><strong>Dirección:</strong> {address || 'No disponible'}</p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSelectLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Confirmar ubicación
        </button>
      </div>
    </div>
  );
};

export default SimpleMapComponent;