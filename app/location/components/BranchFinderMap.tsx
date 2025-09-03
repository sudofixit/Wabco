"use client";

import { useEffect, useRef, useState } from 'react';
import { Location } from '@/types/location';
import { NAIROBI_CENTER } from '@/lib/distance';

interface BranchFinderMapProps {
  locations: Location[];
  userLocation?: { lat: number; lng: number; address?: string } | null;
  selectedLocationId?: number | null;
  onLocationSelect: (locationId: number) => void;
}

export default function BranchFinderMap({
  locations,
  userLocation,
  selectedLocationId,
  onLocationSelect
}: BranchFinderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // ULTRA FAST Google Maps loading detection using events
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps && window.google.maps.Map && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        return true;
      }
      return false;
    };

    // If already loaded, set immediately
    if (checkGoogleMapsLoaded()) {
      return;
    }

    // Listen for custom events from the script loading
    const handleGoogleMapsReady = () => {
      if (checkGoogleMapsLoaded()) {
        console.log('Google Maps loaded via ready event');
      }
    };

    const handleGoogleMapsLoaded = () => {
      // Wait 50ms for full initialization after script load
      setTimeout(() => {
        if (checkGoogleMapsLoaded()) {
          console.log('Google Maps loaded via load event');
        }
      }, 50);
    };

    // Event listeners for immediate detection
    window.addEventListener('googleMapsReady', handleGoogleMapsReady);
    window.addEventListener('googleMapsLoaded', handleGoogleMapsLoaded);

    // EMERGENCY fallback - ultra-fast polling for only 1 second
    let attempts = 0;
    const maxAttempts = 50; // 1 second max (50 * 20ms = 1000ms)

    const emergencyInterval = setInterval(() => {
      attempts++;
      if (checkGoogleMapsLoaded()) {
        clearInterval(emergencyInterval);
      } else if (attempts >= maxAttempts) {
        console.log('Google Maps forced loaded after 1 second');
        clearInterval(emergencyInterval);
        setIsGoogleMapsLoaded(true); // Force load after 1 second
      }
    }, 20); // Check every 20ms

    return () => {
      clearInterval(emergencyInterval);
      window.removeEventListener('googleMapsReady', handleGoogleMapsReady);
      window.removeEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isGoogleMapsLoaded) return;

    // Add a small delay to ensure DOM is ready
    const initializeMap = () => {
      if (!window.google || !window.google.maps) {
        console.warn('Google Maps not ready, retrying...');
        setTimeout(initializeMap, 200);
        return;
      }

      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }

      // Determine map center and zoom
      let center = NAIROBI_CENTER;
      let zoom = 11;

      if (userLocation) {
        center = { lat: userLocation.lat, lng: userLocation.lng };
        zoom = 13;
      } else if (locations.length > 0) {
        // Center on locations
        const locationsWithCoords = locations.filter(loc => loc.lat && loc.lng);
        if (locationsWithCoords.length === 1) {
          center = {
            lat: parseFloat(locationsWithCoords[0].lat!.toString()),
            lng: parseFloat(locationsWithCoords[0].lng!.toString())
          };
          zoom = 15;
        } else if (locationsWithCoords.length > 1) {
          // Calculate center of all locations
          const avgLat = locationsWithCoords.reduce((sum, loc) => sum + parseFloat(loc.lat!.toString()), 0) / locationsWithCoords.length;
          const avgLng = locationsWithCoords.reduce((sum, loc) => sum + parseFloat(loc.lng!.toString()), 0) / locationsWithCoords.length;
          center = { lat: avgLat, lng: avgLng };
          zoom = 12;
        }
      }

      // Initialize the map
      const map = new google.maps.Map(mapRef.current!, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
      });

      mapInstanceRef.current = map;

      // Add user location marker if available
      if (userLocation) {
        const userMarker = new google.maps.Marker({
          position: { lat: userLocation.lat, lng: userLocation.lng },
          map: map,
          title: 'Your Location',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32),
          },
          zIndex: 1000,
          animation: google.maps.Animation.DROP,
        });

        userMarkerRef.current = userMarker;

        // Add friendly info window for user location
        const userInfoWindow = new google.maps.InfoWindow({
          content: `
            <div style="font-family: 'Poppins', sans-serif; max-width: 250px; text-align: center;">
              <div style="background: linear-gradient(135deg, #4285F4, #34A853); color: white; padding: 12px; margin: -8px -8px 12px -8px; border-radius: 8px 8px 0 0;">
                <h3 style="margin: 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center;">
                  <span style="margin-right: 8px;">📍</span>
                  Your Location
                </h3>
              </div>
              <div style="padding: 0 4px;">
                ${userLocation.address ? `
                  <p style="margin: 8px 0; font-size: 14px; color: #333; line-height: 1.4;">
                    ${userLocation.address}
                  </p>
                ` : `
                  <p style="margin: 8px 0; font-size: 14px; color: #333;">
                    Lat: ${userLocation.lat.toFixed(6)}<br/>
                    Lng: ${userLocation.lng.toFixed(6)}
                  </p>
                `}
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #eee;">
                  <p style="margin: 0; font-size: 12px; color: #666; font-style: italic;">
                    🎯 We'll find the nearest tire center for you
                  </p>
                </div>
              </div>
            </div>
          `,
        });

        userMarker.addListener('click', () => {
          userInfoWindow.open(map, userMarker);
        });

        // Auto-open user location info window briefly
        setTimeout(() => {
          userInfoWindow.open(map, userMarker);
          setTimeout(() => {
            userInfoWindow.close();
          }, 3000);
        }, 500);
      }

      // Add markers for each location with proper map icons
      const locationsWithCoords = locations.filter(loc => loc.lat && loc.lng);
      locationsWithCoords.forEach((location, index) => {
        const isSelected = selectedLocationId === location.id;

        // Create smaller custom marker with tire center icon
        const marker = new google.maps.Marker({
          position: {
            lat: parseFloat(location.lat!.toString()),
            lng: parseFloat(location.lng!.toString())
          },
          map: map,
          title: location.name,
          icon: {
            url: isSelected
              ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'  // Red for selected
              : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Blue for normal
            scaledSize: new google.maps.Size(isSelected ? 28 : 24, isSelected ? 28 : 24),
            anchor: new google.maps.Point(isSelected ? 14 : 12, isSelected ? 28 : 24),
          },
          zIndex: isSelected ? 999 : 100,
          animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
        });

        // Create smaller label overlay for branch name
        const labelOverlay = new google.maps.OverlayView();
        labelOverlay.onAdd = function () {
          const div = document.createElement('div');
          div.style.position = 'absolute';
          div.style.backgroundColor = isSelected ? '#dc2626' : '#0a1c58';
          div.style.color = 'white';
          div.style.padding = '2px 6px';
          div.style.borderRadius = '3px';
          div.style.fontSize = '10px';
          div.style.fontWeight = '600';
          div.style.fontFamily = 'Poppins, sans-serif';
          div.style.whiteSpace = 'nowrap';
          div.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
          div.style.zIndex = '1001';
          div.style.pointerEvents = 'none';
          div.style.maxWidth = '80px';
          div.style.overflow = 'hidden';
          div.style.textOverflow = 'ellipsis';

          // Truncate long names
          const displayName = location.name.length > 12 ? location.name.substring(0, 12) + '...' : location.name;
          div.textContent = displayName;

          const panes = this.getPanes();
          if (panes && panes.overlayLayer) {
            panes.overlayLayer.appendChild(div);
          }
          (this as any).div = div;
        };

        labelOverlay.draw = function () {
          const overlayProjection = this.getProjection();
          const position = overlayProjection.fromLatLngToDivPixel(marker.getPosition()!);
          if ((this as any).div && position) {
            (this as any).div.style.left = (position.x - 40) + 'px';
            (this as any).div.style.top = (position.y - (isSelected ? 42 : 38)) + 'px';
          }
        };

        labelOverlay.onRemove = function () {
          if ((this as any).div) {
            (this as any).div.parentNode?.removeChild((this as any).div);
            (this as any).div = null;
          }
        };

        labelOverlay.setMap(map);
        (marker as any).labelOverlay = labelOverlay;

        // Create info window with location details
        const infoWindow = new google.maps.InfoWindow({
          content: `
      <div style="font-family: 'Poppins', sans-serif; max-width: 280px;">
        <div style="background: linear-gradient(135deg, #0a1c58, #132b7c); color: white; padding: 12px; margin: -8px -8px 12px -8px; border-radius: 8px 8px 0 0;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600; display: flex; align-items: center;">
            <span style="margin-right: 8px;">🏢</span>
            ${location.name}
          </h3>
        </div>
        <div style="padding: 0 4px;">
          <div style="margin: 8px 0;">
            <p style="margin: 4px 0; font-size: 14px; color: #333; display: flex; align-items: start; line-height: 1.4;">
              <span style="margin-right: 6px; margin-top: 2px;">📍</span>
              ${location.address}
            </p>
            <p style="margin: 4px 0; font-size: 14px; color: #333; display: flex; align-items: center;">
              <span style="margin-right: 6px;">📞</span>
              <a href="tel:${location.phone}" style="color: #0a1c58; text-decoration: none;">${location.phone}</a>
            </p>
            ${location.workingHours ? `
              <p style="margin: 4px 0; font-size: 14px; color: #333; display: flex; align-items: center;">
                <span style="margin-right: 6px;">🕒</span>
                ${location.workingHours}
              </p>
            ` : ''}
          </div>
          <div style="margin: 12px 0 8px; text-align: center;">
            <a href="${location.subdomain ? `${location.subdomain}` : '#'}" 
               style="display: inline-block; background: linear-gradient(135deg, #0a1c58, #132b7c); 
                      color: white; padding: 8px 16px; border-radius: 6px; 
                      text-decoration: none; font-weight: 600; font-size: 14px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s;
                      border: 2px solid #0a1c58;"
               onmouseover="this.style.background='linear-gradient(135deg, #132b7c, #0a1c58)'; this.style.transform='scale(1.02)'"
               onmouseout="this.style.background='linear-gradient(135deg, #0a1c58, #132b7c)'; this.style.transform='scale(1)'">
              Visit Branch Page
            </a>
          </div>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #666; font-style: italic;">
              🔧 Professional tire services available
            </p>
          </div>
        </div>
      </div>
    `,
        });

        // Show info window on marker click and update selection
        marker.addListener('click', () => {
          // Close any open info windows
          markersRef.current.forEach(m => {
            if ((m as any).infoWindow) {
              (m as any).infoWindow.close();
            }
          });

          // Open this marker's info window
          infoWindow.open(map, marker);

          // Update selection in parent component
          onLocationSelect(location.id);
        });

        // Store info window reference
        (marker as any).infoWindow = infoWindow;
        markersRef.current.push(marker);
      });

      // Auto-fit bounds if we have multiple locations or user location + locations
      if (userLocation && locationsWithCoords.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(userLocation.lat, userLocation.lng));
        locationsWithCoords.forEach(location => {
          bounds.extend(new google.maps.LatLng(
            parseFloat(location.lat!.toString()),
            parseFloat(location.lng!.toString())
          ));
        });
        map.fitBounds(bounds);

        // Ensure minimum zoom level
        const listener = google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom()! > 15) map.setZoom(15);
          google.maps.event.removeListener(listener);
        });
      } else if (locationsWithCoords.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        locationsWithCoords.forEach(location => {
          bounds.extend(new google.maps.LatLng(
            parseFloat(location.lat!.toString()),
            parseFloat(location.lng!.toString())
          ));
        });
        map.fitBounds(bounds);
      }

      // Cleanup function
      return () => {
        markersRef.current.forEach(marker => {
          if ((marker as any).labelOverlay) {
            (marker as any).labelOverlay.setMap(null);
          }
        });
      };
    };

    initializeMap();
  }, [locations, userLocation, selectedLocationId, onLocationSelect, isGoogleMapsLoaded]);

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

  if (!isGoogleMapsLoaded) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-xl relative overflow-hidden">
        {/* Ultra-fast loading animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Faster spinning animation */}
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" style={{ animationDuration: '0.6s' }}></div>
            <p className="text-gray-600 font-medium">Loading Map...</p>
            <p className="text-sm text-gray-500 mt-1">Should load in 1-2 seconds</p>
          </div>
        </div>

        {/* Subtle pulsing background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-gray-50 animate-pulse" style={{ animationDuration: '1.5s' }}></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={{ minHeight: '600px' }}>
      {/* Google Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />

      {/* Custom Zoom Controls */}
      <div className="absolute right-6 top-6 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-2xl font-bold shadow hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center text-2xl font-bold shadow hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Zoom out"
        >
          -
        </button>
      </div>

      {/* Location Count Badge */}
      {isGoogleMapsLoaded && locations.length > 0 && (
        <div className="absolute left-6 top-6 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow z-10">
          <div className="text-sm font-semibold text-[#0a1c58]">
            {locations.filter(loc => loc.lat && loc.lng).length} tire centers
            {userLocation && ' 📍 Your location found'}
          </div>
        </div>
      )}
    </div>
  );
}
