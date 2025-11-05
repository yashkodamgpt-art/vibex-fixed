
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { Event, User } from '../../types';

declare const L: any;

const IITGN_COORDS: [number, number] = [23.1925, 72.6844];
const INITIAL_ZOOM = 13;
const LOCATION_FOUND_ZOOM = 16;
const CREATE_RADIUS_METERS = 5000;

interface MapViewProps {
  isCreateMode: boolean;
  userLocation: [number, number] | null;
  onSetUserLocation: (coords: [number, number]) => void;
  onMapClick: (coords: { lat: number, lng: number }) => void;
  events: Event[];
  user: User;
  activeVibe: Event | null;
  onCloseEvent: (eventId: number) => void;
  onExtendEvent: (eventId: number) => void;
  onJoinVibe: (eventId: number) => void;
  onViewChat: () => void;
}

export interface MapViewRef {
  recenter: () => void;
}

const MapView = forwardRef<MapViewRef, MapViewProps>(({ isCreateMode, userLocation, onSetUserLocation, onMapClick, events, user, activeVibe, onCloseEvent, onExtendEvent, onJoinVibe, onViewChat }, ref) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const eventsLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

  const [displayCoords, setDisplayCoords] = useState<{ lat: number; lng: number }>({ lat: IITGN_COORDS[0], lng: IITGN_COORDS[1] });
  const [error, setError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useImperativeHandle(ref, () => ({
    recenter: () => {
      if (mapInstanceRef.current && userLocation) {
        mapInstanceRef.current.flyTo(userLocation, LOCATION_FOUND_ZOOM);
      }
    }
  }));

  // Effect 1: Initialize map instance
  useEffect(() => {
    if (!mapRef.current || typeof L === 'undefined') {
        console.error("MapView: Leaflet library (L) is not defined or map container is not available.");
        setError("Map could not be loaded.");
        return;
    }
    console.log('🗺️ Initializing map...');

    const map = L.map(mapRef.current, { center: IITGN_COORDS, zoom: INITIAL_ZOOM, zoomControl: false, preferCanvas: true });
    mapInstanceRef.current = map;
    
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      keepBuffer: 2,
    }).addTo(map);
    L.control.scale({ position: 'bottomright' }).addTo(map);

    userMarkerRef.current = L.marker(IITGN_COORDS).addTo(map);
    eventsLayerRef.current = L.layerGroup().addTo(map);
    
    console.log('✅ Map ready');
    setTimeout(() => map.invalidateSize(), 100);

    return () => { map.remove(); };
  }, []);

  // Effect 2: Get user location (runs after map is initialized)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    console.log('📍 Getting location...');
    setLoadingLocation(true);
    setError(null);

    const locationTimeout = setTimeout(() => {
        console.warn('Location request timed out after 5 seconds.');
        setError('Could not get your location in time. Showing default location.');
        setLoadingLocation(false);
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(locationTimeout);
        const userCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
        console.log(`✅ Location found: [${userCoords[0]}, ${userCoords[1]}]`);
        onSetUserLocation(userCoords);

        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(userCoords, LOCATION_FOUND_ZOOM);
            if (userMarkerRef.current) userMarkerRef.current.setLatLng(userCoords);
        }
        setDisplayCoords({ lat: userCoords[0], lng: userCoords[1] });
        setError(null);
        setLoadingLocation(false);
      },
      (geoError: GeolocationPositionError) => {
        clearTimeout(locationTimeout);
        console.error('Geolocation error:', geoError);
        let errorMessage = 'Unable to retrieve your location.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          errorMessage = 'Location access denied. Please enable it in your browser settings.';
        }
        setError(errorMessage);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
    );

    return () => clearTimeout(locationTimeout);
  }, [onSetUserLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleClick = (e: any) => {
      if (!isCreateMode || !userLocation) return;
      
      const clickLatLng = e.latlng;
      const userLatLng = L.latLng(userLocation[0], userLocation[1]);

      if (userLatLng.distanceTo(clickLatLng) <= CREATE_RADIUS_METERS) {
        onMapClick({ lat: clickLatLng.lat, lng: clickLatLng.lng });
      } else {
        alert("Please select a location within the 5km radius.");
      }
    };

    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [isCreateMode, onMapClick, userLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapRef.current) return;

    if (isCreateMode && userLocation) {
      if (!radiusCircleRef.current) {
        radiusCircleRef.current = L.circle(userLocation, {
          radius: CREATE_RADIUS_METERS,
          color: '#a855f7',
          fillColor: '#c084fc',
          fillOpacity: 0.1,
          weight: 2,
        }).addTo(map);
      }
      mapRef.current.style.cursor = 'crosshair';
    } else {
      if (radiusCircleRef.current) {
        radiusCircleRef.current.remove();
        radiusCircleRef.current = null;
      }
      mapRef.current.style.cursor = '';
    }
  }, [isCreateMode, userLocation]);

  useEffect(() => {
    const layer = eventsLayerRef.current;
    const map = mapInstanceRef.current;
    if (!layer || !map || !user) return;

    layer.clearLayers();
    const now = new Date().getTime();
    
    const activeEvents = events.filter(event => {
        if (event.status !== 'active') return false;
        const endTime = new Date(event.event_time).getTime() + event.duration * 60 * 1000;
        return now < endTime;
    });

    activeEvents.forEach(event => {
      if (!event.is_public && event.creator_id !== user.id) return;

      const participantCount = event.participants?.length || 1;
      const markerSize = Math.min(24 + (participantCount - 1) * 4, 48);

      const eventIcon = L.divIcon({
        className: 'event-marker',
        iconSize: [markerSize, markerSize],
      });
      
      const eventMarker = L.marker([event.lat, event.lng], { icon: eventIcon }).addTo(layer);
      
      const popupNode = document.createElement('div');
      popupNode.className = "p-1 font-sans";
      popupNode.innerHTML = `
        <h3 class="font-bold text-lg text-purple-800">${event.title}</h3>
        ${event.description ? `<p class="text-gray-700 my-1">${event.description}</p>` : ''}
        <div class="flex flex-wrap gap-1 my-2">
          ${event.topics.map(topic => `<span class="bg-purple-200 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full">${topic}</span>`).join('')}
        </div>
        <p class="text-xs text-gray-500">Ends at: ${new Date(new Date(event.event_time).getTime() + event.duration * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        <p class="text-xs text-gray-500 font-medium">👥 ${participantCount} ${participantCount > 1 ? 'Vibing' : 'Vibing'}</p>
      `;
      
      const controlsContainer = document.createElement('div');
      controlsContainer.className = "mt-2 pt-2 border-t border-gray-200 flex flex-wrap items-center gap-2";

      if (user.id === event.creator_id) {
          const extendButton = document.createElement('button');
          extendButton.className = "text-xs bg-green-100 text-green-800 font-semibold px-2 py-1 rounded hover:bg-green-200 transition-colors";
          extendButton.innerText = "Extend (+15m)";
          controlsContainer.appendChild(extendButton);
          L.DomEvent.on(extendButton, 'click', () => { onExtendEvent(event.id); map.closePopup(); });

          const closeButton = document.createElement('button');
          closeButton.className = "text-xs bg-red-100 text-red-800 font-semibold px-2 py-1 rounded hover:bg-red-200 transition-colors";
          closeButton.innerText = "Close Vibe";
          controlsContainer.appendChild(closeButton);
          L.DomEvent.on(closeButton, 'click', () => { onCloseEvent(event.id); map.closePopup(); });
      }

      if (event.participants.includes(user.id)) {
          const viewChatButton = document.createElement('button');
          viewChatButton.className = "w-full text-center font-bold bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors";
          viewChatButton.innerText = "View Chat";
          controlsContainer.appendChild(viewChatButton);
          L.DomEvent.on(viewChatButton, 'click', () => { onJoinVibe(event.id); onViewChat(); map.closePopup(); });
      } else {
          const joinButton = document.createElement('button');
          joinButton.className = "w-full text-center font-bold bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed";
          joinButton.innerText = "Join Vibe";
          if (activeVibe) {
              joinButton.disabled = true;
              joinButton.innerText = "In another Vibe";
          }
          controlsContainer.appendChild(joinButton);
          L.DomEvent.on(joinButton, 'click', () => { onJoinVibe(event.id); map.closePopup(); });
      }
      
      if(controlsContainer.hasChildNodes()) popupNode.appendChild(controlsContainer);
      eventMarker.bindPopup(popupNode);
    });
  }, [events, user, activeVibe, onCloseEvent, onExtendEvent, onJoinVibe, onViewChat]);

  return (
    <div className="relative w-full h-full bg-green-200 z-0">
      <div ref={mapRef} className="w-full h-full" role="application" aria-label="Interactive map" />
      
      {error && (
        <p className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-11/12 max-w-md text-center text-sm text-yellow-800 bg-yellow-100 p-3 rounded-lg shadow-md" role="alert">
          {error}
        </p>
      )}
      
      <div className="absolute bottom-4 left-4 z-[1000] p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-md">
        {loadingLocation ? (
          <p className="text-gray-700 font-semibold text-sm animate-pulse">Finding you...</p>
        ) : (
          <div>
            <p className="text-gray-900 font-mono text-xs">Lat: {displayCoords.lat.toFixed(4)}</p>
            <p className="text-gray-900 font-mono text-xs">Lon: {displayCoords.lng.toFixed(4)}</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default MapView;
