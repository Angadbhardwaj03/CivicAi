"use client"
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// Fix Next.js Leaflet icon bug
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function SearchField({ onLocationSet }: { onLocationSet: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    // Fix TS issue by asserting any for the leaflet-geosearch control options
    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Enter street address or area...'
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (e: any) => {
      onLocationSet(e.location.y, e.location.x);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onLocationSet]);

  return null;
}

function LocationMarker({ onLocationSet }: { onLocationSet: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSet(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
    locationfound(e) {
      setPosition(e.latlng);
      onLocationSet(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    }
  });

  return position === null ? null : <Marker position={position} />
}

export default function MapPicker({ onLocationSet }: { onLocationSet: (lat: number, lng: number) => void }) {
  return (
    <div style={{ height: "300px", width: "100%", borderRadius: "1rem", overflow: "hidden", zIndex: 0, border: '1px solid var(--border)' }}>
      <MapContainer 
        center={[28.6139, 77.2090]} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SearchField onLocationSet={onLocationSet} />
        <LocationMarker onLocationSet={onLocationSet} />
      </MapContainer>
    </div>
  );
}
