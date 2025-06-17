"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Location } from '@/types/location';
import { calculateDistance, NAIROBI_CENTER } from '@/lib/distance';

// Dynamic import for Google Maps component - loads only when needed
const BranchFinderMap = dynamic(() => import('./BranchFinderMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center" style={{ minHeight: '600px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a1c58] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

interface BranchFinderProps {
  locations: Location[];
}

interface LocationWithDistance extends Location {
  distance?: number;
}

interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

export default function BranchFinder({ locations }: BranchFinderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [filteredLocations, setFilteredLocations] = useState<LocationWithDistance[]>(locations);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // ULTRA FAST Google Maps readiness detection using events
  useEffect(() => {
    const checkGoogleMapsReady = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsReady(true);
        return true;
      }
      return false;
    };

    // Check immediately first
    if (checkGoogleMapsReady()) {
      return;
    }

    // Listen for custom events from the script loading
    const handleGoogleMapsReady = () => {
      if (checkGoogleMapsReady()) {
        console.log('Google Maps API ready via event');
      }
    };

    const handleGoogleMapsLoaded = () => {
      // Wait 50ms for full initialization after script load
      setTimeout(() => {
        if (checkGoogleMapsReady()) {
          console.log('Google Maps API ready via load event');
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
      if (checkGoogleMapsReady()) {
        clearInterval(emergencyInterval);
      } else if (attempts >= maxAttempts) {
        console.log('Google Maps API forced ready after 1 second');
        clearInterval(emergencyInterval);
        setIsGoogleMapsReady(true); // Force ready after 1 second
      }
    }, 20); // Check every 20ms

    return () => {
      clearInterval(emergencyInterval);
      window.removeEventListener('googleMapsReady', handleGoogleMapsReady);
      window.removeEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
    };
  }, []);

  // Initialize Google Places Autocomplete only when ready
  useEffect(() => {
    if (!isGoogleMapsReady || !searchInputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
      types: ['establishment', 'geocode'], // Include both establishments (restaurants, etc.) and addresses
      componentRestrictions: { country: 'ke' },
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(-1.444471, 36.641006), // SW bound of Nairobi
        new google.maps.LatLng(-1.163332, 37.106876)  // NE bound of Nairobi
      ),
      strictBounds: false, // Allow results outside bounds but prioritize within
      fields: ['place_id', 'geometry', 'name', 'formatted_address', 'types'], // Request specific fields
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      // Ensure we have proper place data
      if (!place.geometry || !place.geometry.location) {
        console.log('No geometry found for place');
        return;
      }

      const searchLat = place.geometry.location.lat();
      const searchLng = place.geometry.location.lng();
      
      // Use place name if available, otherwise use formatted address
      const placeName = place.name || place.formatted_address || searchQuery;
      const placeAddress = place.formatted_address || `${searchLat.toFixed(6)}, ${searchLng.toFixed(6)}`;
      
      // Update search input with the selected place name
      setSearchQuery(placeName);
      
      // Calculate distances for all locations and sort by nearest
      const locationsWithDistance = locations
        .filter(loc => loc.lat && loc.lng)
        .map(location => ({
          ...location,
          distance: calculateDistance(
            searchLat,
            searchLng,
            parseFloat(location.lat!.toString()),
            parseFloat(location.lng!.toString())
          )
        }))
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setUserLocation({
        lat: searchLat,
        lng: searchLng,
        address: placeAddress
      });
      setFilteredLocations(locationsWithDistance);
      setSearchMessage(`Found ${locationsWithDistance.length} branches near "${placeName}"`);
      
      // Highlight the nearest location
      if (locationsWithDistance.length > 0) {
        setSelectedLocationId(locationsWithDistance[0].id);
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [locations, searchQuery, isGoogleMapsReady]);

  // Default state: show all locations without distances
  useEffect(() => {
    setFilteredLocations(locations);
    setSearchMessage('Search for your area or use your location to find the nearest branch.');
  }, [locations]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredLocations(locations);
      setUserLocation(null);
      setSearchMessage('Search for your area or use your location to find the nearest branch.');
      return;
    }

    try {
      // Use Google Geocoding with multiple search strategies
      const geocoder = new google.maps.Geocoder();
      
      // First try: Search as-is with establishment bias
      const searchStrategies = [
        `${searchQuery}, Nairobi, Kenya`,
        searchQuery, // Raw search for famous places
        `${searchQuery} Nairobi Kenya`, // Alternative format
      ];

      let foundResult = false;

      for (const searchAddress of searchStrategies) {
        if (foundResult) break;

        await new Promise<void>((resolve) => {
          geocoder.geocode(
            { 
              address: searchAddress,
              componentRestrictions: { country: 'KE' },
              region: 'ke' // Bias towards Kenya
            },
            (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                const searchLat = location.lat();
                const searchLng = location.lng();
                
                // Calculate distances and sort by nearest (show ALL locations)
                const locationsWithDistance = locations
                  .filter(loc => loc.lat && loc.lng)
                  .map(location => ({
                    ...location,
                    distance: calculateDistance(
                      searchLat,
                      searchLng,
                      parseFloat(location.lat!.toString()),
                      parseFloat(location.lng!.toString())
                    )
                  }))
                  .sort((a, b) => (a.distance || 0) - (b.distance || 0));

                setUserLocation({
                  lat: searchLat,
                  lng: searchLng,
                  address: results[0].formatted_address
                });
                setFilteredLocations(locationsWithDistance);
                setSearchMessage(`Found ${locationsWithDistance.length} branches near "${searchQuery}"`);
                
                // Highlight the nearest location
                if (locationsWithDistance.length > 0) {
                  setSelectedLocationId(locationsWithDistance[0].id);
                }
                
                foundResult = true;
              }
              resolve();
            }
          );
        });
      }

      if (!foundResult) {
        // No results found with any strategy
        setFilteredLocations([]);
        setUserLocation(null);
        setSearchMessage(`No location found for "${searchQuery}". Try searching for a Nairobi area, street, or landmark.`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setSearchMessage('Unable to search location. Please try again.');
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Calculate distances to all locations and sort by nearest
        const locationsWithDistance = locations
          .filter(loc => loc.lat && loc.lng)
          .map(location => ({
            ...location,
            distance: calculateDistance(
              userLat,
              userLng,
              parseFloat(location.lat!.toString()),
              parseFloat(location.lng!.toString())
            )
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setUserLocation({ lat: userLat, lng: userLng });
        setFilteredLocations(locationsWithDistance);
        setSearchMessage(`Found ${locationsWithDistance.length} branches near your location`);
        setSearchQuery(''); // Clear search input

        // Highlight the nearest location
        if (locationsWithDistance.length > 0) {
          setSelectedLocationId(locationsWithDistance[0].id);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert('Location access denied. Please enable location access and try again.');
        } else {
          alert('Unable to get your location. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleLocationSelect = (locationId: number) => {
    setSelectedLocationId(locationId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* Left Sidebar - Search & Results */}
        <div className="w-full lg:w-[35%] flex flex-col">
          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-[#0a1c58] mb-4">Find Your Nearest Branch</h2>
            
            {/* Search Input with Autocomplete */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search Nairobi area, street, or landmark"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-[#0a1c58] text-gray-900"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 bg-[#0a1c58] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#132b7c] focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2 transition-colors"
              >
                Search
              </button>
              <button
                onClick={handleUseMyLocation}
                disabled={isGettingLocation}
                className="flex-1 bg-white text-[#0a1c58] border-2 border-[#0a1c58] px-6 py-3 rounded-lg font-semibold hover:bg-[#0a1c58] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGettingLocation ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting location...
                  </span>
                ) : (
                  'Use my location'
                )}
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 overflow-hidden">
            <div className="mb-4">
              <p className="text-sm text-gray-600">{searchMessage}</p>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => handleLocationSelect(location.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedLocationId === location.id
                      ? 'border-[#0a1c58] bg-[#0a1c58]/5 shadow-md'
                      : 'border-gray-200 hover:border-[#0a1c58]/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#0a1c58] text-lg">{location.name}</h3>
                    {location.distance !== undefined && (
                      <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {location.distance} km
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {location.address}
                    </p>
                    
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {location.phone}
                    </p>
                    
                    {location.workingHours && (
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {location.workingHours}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredLocations.length === 0 && searchMessage.includes('No branches found') && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-lg font-medium">No branches found</p>
                  <p className="text-sm">Try searching a different area in Nairobi</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="w-full lg:w-[65%]">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ minHeight: '600px' }}>
            <BranchFinderMap
              locations={filteredLocations}
              userLocation={userLocation}
              selectedLocationId={selectedLocationId}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 