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
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
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
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error en geocodificación:', error);
    return null;
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
  
  // Usar initialLocation si se proporciona
  const initialPos = initialLocation || DEFAULT_LOCATION;
  
  const [position, setPosition] = useState({
    lat: initialPos.lat || DEFAULT_LOCATION.lat,
    lng: initialPos.lng || DEFAULT_LOCATION.lng
  });
  const [address, setAddress] = useState(initialPos.address || '');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerId = `map-${Date.now()}`;
  
  // Inicializar el mapa
  useEffect(() => {
    // Crear mapa
    try {
      const map = L.map(mapContainerId).setView([position.lat, position.lng], 13);
      mapRef.current = map;
      
      // Añadir capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Añadir marcador
      const marker = L.marker([position.lat, position.lng], { draggable: true }).addTo(map);
      markerRef.current = marker;
      
      // Manejar arrastre del marcador
      marker.on('dragend', async function(e) {
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
      });
      
      // Obtener dirección inicial si es necesario
      if (initialPos.lat && initialPos.lng && !initialPos.address) {
        (async () => {
          try {
            const addressResult = await reverseGeocode(initialPos.lat, initialPos.lng);
            if (addressResult) {
              setAddress(addressResult);
            }
          } catch (err) {
            console.error('Error al obtener dirección inicial:', err);
          }
        })();
      }
    } catch (err) {
      console.error('Error al inicializar el mapa:', err);
      setError('Error al inicializar el mapa. Intente nuevamente más tarde.');
    }
    
    // Limpiar al desmontar
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);
  
  // Manejar búsqueda de dirección
  const handleSearch = async () => {
    if (!searchText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await geocodeAddress(searchText);
      
      if (result) {
        setPosition({ lat: result.lat, lng: result.lng });
        setAddress(result.displayName);
        
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([result.lat, result.lng]);
          mapRef.current.setView([result.lat, result.lng], 15);
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
  
  // Manejar tecla Enter en el campo de búsqueda
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
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
      <div className="flex gap-2">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar dirección (ej: San Luis 1234, Argentina)"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </div>
      
      {error && (
        <div className="p-2 text-sm text-red-500 bg-red-50 border border-red-100 rounded">
          {error}
        </div>
      )}
      
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