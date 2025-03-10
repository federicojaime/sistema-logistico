import React, { useState, useEffect } from 'react';
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

const SimpleMapComponent = ({ initialLocation, onSelectLocation }) => {
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState(
    initialLocation || { lat: 25.761681, lng: -80.191788 }
  );
  const mapContainerId = `map-${Math.random().toString(36).substring(2, 11)}`;

  // Inicializar el mapa cuando el componente se monta
  useEffect(() => {
    // Crear una instancia del mapa
    const map = L.map(mapContainerId).setView(
      [position.lat, position.lng], 
      13
    );

    // Añadir el tile layer de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Añadir un marcador inicial
    let marker = L.marker([position.lat, position.lng]).addTo(map);

    // Manejar clics en el mapa
    map.on('click', function(e) {
      const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPosition);
      
      // Actualizar el marcador
      marker.setLatLng(e.latlng);
      
      // Intentar geocodificar la posición (versión simplificada)
      reverseGeocode(newPosition);
    });

    // Función sencilla de geocodificación inversa usando Nominatim
    const reverseGeocode = async (pos) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data = await response.json();
        
        if (data && data.display_name) {
          setAddress(data.display_name);
        }
      } catch (error) {
        console.error("Error en geocodificación inversa:", error);
      }
    };

    // Función de búsqueda de dirección
    const geocodeAddress = async (searchText) => {
      if (!searchText.trim()) return;
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`,
          { headers: { 'Accept-Language': 'es' } }
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const result = data[0];
          const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
          
          // Actualizar posición y marcador
          setPosition(newPos);
          marker.setLatLng([newPos.lat, newPos.lng]);
          map.flyTo([newPos.lat, newPos.lng], 15);
          
          // Actualizar dirección
          setAddress(result.display_name);
        } else {
          alert("No se encontraron resultados para esta dirección");
        }
      } catch (error) {
        console.error("Error en geocodificación:", error);
      }
    };

    // Configurar la función de búsqueda
    const searchButton = document.getElementById(`search-button-${mapContainerId}`);
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        const searchInput = document.getElementById(`search-input-${mapContainerId}`);
        if (searchInput) {
          geocodeAddress(searchInput.value);
        }
      });
    }

    // Geocodificar la posición inicial si existe
    if (initialLocation && initialLocation.lat && initialLocation.lng) {
      reverseGeocode(initialLocation);
    }

    // Limpiar al desmontar
    return () => {
      map.remove();
    };
  }, [mapContainerId, initialLocation]);

  // Actualizar la dirección en el input cuando cambia
  useEffect(() => {
    const searchInput = document.getElementById(`search-input-${mapContainerId}`);
    if (searchInput && address) {
      searchInput.value = address;
    }
  }, [address, mapContainerId]);

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
      <div className="flex gap-2">
        <input
          id={`search-input-${mapContainerId}`}
          type="text"
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ingresar dirección"
          defaultValue={address}
        />
        <button
          id={`search-button-${mapContainerId}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Buscar
        </button>
      </div>

      <div 
        id={mapContainerId} 
        className="h-64 rounded-lg border"
        style={{ height: '300px', width: '100%' }}
      ></div>

      <div className="text-sm text-gray-600">
        <p><strong>Latitud:</strong> {position.lat.toFixed(6)}</p>
        <p><strong>Longitud:</strong> {position.lng.toFixed(6)}</p>
        <p><strong>Dirección:</strong> {address || 'No disponible'}</p>
      </div>

      <div className="flex justify-end">
        <button
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