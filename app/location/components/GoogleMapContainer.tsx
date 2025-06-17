"use client";

import { useEffect, useRef } from 'react';
import { Location } from '@/types/location';

interface GoogleMapContainerProps {
  locations?: Location[];
}

export default function GoogleMapContainer({ locations = [] }: GoogleMapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Determine map center based on locations or default to Nairobi (where your locations are)
    let center = { lat: -1.2921, lng: 36.8219 }; // Nairobi center
    let zoom = 10;

    // If we have locations with coordinates, center on them
    const locationsWithCoords = locations.filter(loc => loc.lat && loc.lng);
    if (locationsWithCoords.length > 0) {
      if (locationsWithCoords.length === 1) {
        center = { 
          lat: parseFloat(locationsWithCoords[0].lat!.toString()), 
          lng: parseFloat(locationsWithCoords[0].lng!.toString()) 
        };
        zoom = 15;
      } else {
        // Calculate center of all locations
        const avgLat = locationsWithCoords.reduce((sum, loc) => sum + parseFloat(loc.lat!.toString()), 0) / locationsWithCoords.length;
        const avgLng = locationsWithCoords.reduce((sum, loc) => sum + parseFloat(loc.lng!.toString()), 0) / locationsWithCoords.length;
        center = { lat: avgLat, lng: avgLng };
        zoom = 11;
      }
    }

    // Initialize the map
    const map = new google.maps.Map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false, // Disable default zoom controls (we have custom ones)
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        // Optional: Add custom styling here later for brand consistency
      ],
    });

    mapInstanceRef.current = map;

    // Add markers for each location with coordinates
    locationsWithCoords.forEach((location) => {
      const marker = new google.maps.Marker({
        position: { 
          lat: parseFloat(location.lat!.toString()), 
          lng: parseFloat(location.lng!.toString()) 
        },
        map: map,
        title: location.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#0a1c58" stroke="white" stroke-width="3"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16),
        },
      });

      // Create info window with location details
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family: 'Poppins', sans-serif; max-width: 250px;">
            <h3 style="color: #0a1c58; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${location.name}</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #666;">📍 ${location.address}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #666;">📞 ${location.phone}</p>
            ${location.workingHours ? `<p style="margin: 4px 0; font-size: 14px; color: #666;">🕒 ${location.workingHours}</p>` : ''}
            <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
              <button onclick="window.location.href='/contact-us'" style="background: #0a1c58; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500;">Get Quote</button>
              <button onclick="window.location.href='/contact-us'" style="background: transparent; color: #0a1c58; border: 2px solid #0a1c58; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; font-weight: 500;">Book Service</button>
            </div>
          </div>
        `,
      });

      // Show info window on marker click
      marker.addListener('click', () => {
        // Close any open info windows
        markersRef.current.forEach(m => {
          if ((m as any).infoWindow) {
            (m as any).infoWindow.close();
          }
        });
        infoWindow.open(map, marker);
      });

      // Store info window reference
      (marker as any).infoWindow = infoWindow;
      markersRef.current.push(marker);
    });

  }, [locations]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 10;
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom() || 10;
      mapInstanceRef.current.setZoom(Math.max(currentZoom - 1, 1));
    }
  };

  return (
    <div className="relative w-full max-w-[1303px]" style={{ height: 550 }}>
      {/* Google Map Container */}
      <div 
        ref={mapRef}
        className="w-full h-full rounded-2xl"
        style={{ borderRadius: 16 }}
      />
      
      {/* Custom Zoom Controls */}
      <div className="absolute right-6 top-6 flex flex-col gap-2 z-10">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-2xl font-bold shadow hover:bg-gray-100 transition-colors"
          aria-label="Zoom in"
        >
          +
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-2xl font-bold shadow hover:bg-gray-100 transition-colors"
          aria-label="Zoom out"
        >
          -
        </button>
      </div>
      
      {/* Location Count Badge */}
      {locations.length > 0 && (
        <div className="absolute left-6 top-6 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow z-10">
          <div className="text-sm font-semibold text-[#0a1c58]">
            {locations.filter(loc => loc.lat && loc.lng).length} locations found
          </div>
        </div>
      )}
    </div>
  );
} 