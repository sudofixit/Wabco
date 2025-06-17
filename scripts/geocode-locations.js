require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function geocodeAddress(address) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not found in environment variables');
  }

  // Try original address first
  let searchAddress = address;
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // If no results or ambiguous, try with Dubai, UAE
    if (data.status !== 'OK' || data.results.length === 0) {
      console.log(`No results for "${address}", trying with Dubai, UAE...`);
      searchAddress = `${address}, Dubai, UAE`;
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${apiKey}`;
      
      const response2 = await fetch(url);
      const data2 = await response2.json();
      
      if (data2.status !== 'OK' || data2.results.length === 0) {
        throw new Error(`Geocoding failed for: ${address}`);
      }
      
      return data2.results[0];
    }
    
    return data.results[0];
  } catch (error) {
    console.error(`Error geocoding address "${address}":`, error.message);
    throw error;
  }
}

async function geocodeAllLocations() {
  try {
    console.log('🗺️  Starting geocoding process...');
    
    // Get all locations that don't have coordinates yet
    const locations = await prisma.location.findMany({
      where: {
        OR: [
          { lat: null },
          { lng: null }
        ]
      }
    });
    
    console.log(`Found ${locations.length} locations to geocode`);
    
    if (locations.length === 0) {
      console.log('✅ All locations already have coordinates!');
      return;
    }
    
    for (const location of locations) {
      console.log(`\n📍 Geocoding: ${location.name} - ${location.address}`);
      
      try {
        const result = await geocodeAddress(location.address);
        const { lat, lng } = result.geometry.location;
        
        // Update the location with coordinates
        await prisma.location.update({
          where: { id: location.id },
          data: {
            lat: lat,
            lng: lng
          }
        });
        
        console.log(`   ✅ Success: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        console.log(`   📧 Formatted address: ${result.formatted_address}`);
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        console.log(`   ⚠️  You may need to manually set coordinates for: ${location.name}`);
      }
    }
    
    console.log('\n🎉 Geocoding process completed!');
    
  } catch (error) {
    console.error('Error in geocoding process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
geocodeAllLocations(); 