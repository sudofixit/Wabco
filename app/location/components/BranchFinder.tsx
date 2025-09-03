"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Location } from '@/types/location';
import { calculateDistance } from '@/lib/distance';
import toast from 'react-hot-toast';

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
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Google Maps readiness detection
  useEffect(() => {
    const checkGoogleMapsReady = (): boolean => {
      return !!(window.google &&
        window.google.maps &&
        window.google.maps.places &&
        window.google.maps.places.Autocomplete &&
        window.google.maps.Geocoder);
    };

    if (checkGoogleMapsReady()) {
      setIsGoogleMapsReady(true);
      return;
    }

    let attempts = 0;
    const maxAttempts = 100; // 5 seconds max (100 * 50ms = 5000ms)

    const checkInterval = setInterval(() => {
      attempts++;
      if (checkGoogleMapsReady()) {
        setIsGoogleMapsReady(true);
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        console.warn('Google Maps API not ready after 5 seconds, proceeding without autocomplete');
        clearInterval(checkInterval);
      }
    }, 50);

    return () => clearInterval(checkInterval);
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!isGoogleMapsReady || !searchInputRef.current || autocompleteRef.current) {
      return;
    }

    try {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['geocode'],
        fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components'],
      });

      const handlePlaceChanged = () => {
        const place = autocomplete.getPlace();
        if (place && place.geometry && place.geometry.location) {
          handlePlaceSelect(place);
        }
      };

      autocomplete.addListener('place_changed', handlePlaceChanged);
      autocompleteRef.current = autocomplete;

    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isGoogleMapsReady]);

  // Set initial message and locations
  useEffect(() => {
    setFilteredLocations(locations);
    setSearchMessage('Search for your area or use your location to find the nearest branch.');
  }, [locations]);

  // Update message styling helper
  const updateMessageStyle = useCallback((isError: boolean = false) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const messageElement = document.querySelector('.search-message');
      if (messageElement) {
        if (isError) {
          messageElement.classList.add('text-red-600');
          messageElement.classList.remove('text-gray-600');
        } else {
          messageElement.classList.remove('text-red-600');
          messageElement.classList.add('text-gray-600');
        }
      }
    }, 10);
  }, []);

  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (!place.geometry || !place.geometry.location) {
      console.warn('No geometry found for selected place');
      return;
    }

    const searchLat = place.geometry.location.lat();
    const searchLng = place.geometry.location.lng();
    const placeName = place.name || place.formatted_address || searchQuery.trim();
    const placeAddress = place.formatted_address || `${searchLat.toFixed(6)}, ${searchLng.toFixed(6)}`;

    // Clear any existing search state
    setIsSearching(false);

    // Update search input with the selected place name
    setSearchQuery(placeName);

    // Calculate distances and sort by nearest
    const locationsWithDistance = locations
      .filter(loc => loc.lat && loc.lng && !isNaN(parseFloat(loc.lat.toString())) && !isNaN(parseFloat(loc.lng.toString())))
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
    updateMessageStyle(false);

    // Highlight the nearest location
    if (locationsWithDistance.length > 0) {
      setSelectedLocationId(locationsWithDistance[0].id);
    }

    // Scroll to map section
    setTimeout(() => {
      const mapSection = document.querySelector('[data-map-container]');
      if (mapSection) {
        mapSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  }, [locations, searchQuery, updateMessageStyle]);

  const handleSearch = useCallback(async () => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSearchMessage('Please enter a location to search');
      updateMessageStyle(true);
      setFilteredLocations(locations);
      setUserLocation(null);
      setSelectedLocationId(null);
      toast.error('Please enter a location to search');
      return;
    }

    if (!isGoogleMapsReady || !window.google?.maps?.Geocoder) {
      setSearchMessage('Map services are still loading. Please try again in a moment.');
      updateMessageStyle(true);
      return;
    }

    setIsSearching(true);
    updateMessageStyle(false);

    try {
      const geocoder = new google.maps.Geocoder();

      const geocodePromise = new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode(
          { address: trimmedQuery },
          (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      // Add timeout for geocoding request
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Search timeout')), 10000);
      });

      const results = await Promise.race([geocodePromise, timeoutPromise]);
      const result = results[0];

      const location = result.geometry.location;
      const searchLat = location.lat();
      const searchLng = location.lng();

      // Calculate distances and sort by nearest
      const locationsWithDistance = locations
        .filter(loc => loc.lat && loc.lng && !isNaN(parseFloat(loc.lat.toString())) && !isNaN(parseFloat(loc.lng.toString())))
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
        address: result.formatted_address
      });

      setFilteredLocations(locationsWithDistance);
      setSearchMessage(`Found ${locationsWithDistance.length} branches near "${trimmedQuery}"`);
      updateMessageStyle(false);

      // Highlight the nearest location
      if (locationsWithDistance.length > 0) {
        setSelectedLocationId(locationsWithDistance[0].id);
      } else {
        setSelectedLocationId(null);
      }

      // Scroll to map after search
      setTimeout(() => {
        const mapElement = document.querySelector('[data-map-container]');
        if (mapElement) {
          mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (error) {
      console.error('Search error:', error);

      let errorMessage = `No location found for "${trimmedQuery}". `;

      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Search timed out. Please try again.';
        } else if (error.message.includes('ZERO_RESULTS')) {
          errorMessage += 'Try searching for a different area, city, or landmark.';
        } else {
          errorMessage += 'Please try a different search term.';
        }
      }

      setSearchMessage(errorMessage);
      updateMessageStyle(true);
      setFilteredLocations([]);
      setUserLocation(null);
      setSelectedLocationId(null);

    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, isGoogleMapsReady, locations, updateMessageStyle]);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setSearchMessage('Geolocation is not supported by your browser');
      updateMessageStyle(true);
      return;
    }

    setIsGettingLocation(true);
    setSearchQuery(''); // Clear search input
    updateMessageStyle(false);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Calculate distances to all locations and sort by nearest
        const locationsWithDistance = locations
          .filter(loc => loc.lat && loc.lng && !isNaN(parseFloat(loc.lat.toString())) && !isNaN(parseFloat(loc.lng.toString())))
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
        updateMessageStyle(false);

        // Highlight the nearest location
        if (locationsWithDistance.length > 0) {
          setSelectedLocationId(locationsWithDistance[0].id);
        }

        setIsGettingLocation(false);

        // Scroll to map section
        setTimeout(() => {
          const mapSection = document.querySelector('[data-map-container]');
          if (mapSection) {
            mapSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 300);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);

        let errorMessage = 'Unable to get your location. ';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access was denied. Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Your location is currently unavailable. Please check your connection and try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'Unable to get your location. Please try searching manually.';
        }

        setSearchMessage(errorMessage);
        updateMessageStyle(true);
      },
      options
    );
  }, [locations, updateMessageStyle]);

  const handleLocationSelect = useCallback((locationId: number) => {
    setSelectedLocationId(locationId);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch, isSearching]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

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
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Search area, street, or landmark"
                  disabled={isSearching}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:border-[#0a1c58] text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="animate-spin h-4 w-4 text-[#0a1c58]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="flex-1 bg-[#0a1c58] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#132b7c] focus:outline-none focus:ring-2 focus:ring-[#0a1c58] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
              <button
                onClick={handleUseMyLocation}
                disabled={isGettingLocation || isSearching}
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
              <p className="text-sm search-message text-gray-600">
                {searchMessage}
              </p>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedLocationId === location.id
                      ? 'border-[#0a1c58] bg-[#0a1c58]/5 shadow-md'
                      : 'border-gray-200 hover:border-[#0a1c58]/50'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-[#0a1c58] text-lg">{location.name}</h3>
                      {location.distance !== undefined && (
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {location.distance.toFixed(1)} km
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
                ))
              ) : searchMessage.includes('No location found') || searchMessage === '' ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-lg font-medium">No branches found</p>
                  <p className="text-sm">Try searching a different area</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Side - Map */}
        <div className="w-full lg:w-[65%]" data-map-container>
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