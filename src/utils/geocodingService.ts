// Geocoding service for Swedish golf clubs
// Using Nominatim (OpenStreetMap) as it's free and doesn't require API keys

interface GeocodeResult {
  latitude: number;
  longitude: number;
  success: boolean;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

// Rate limiting to be respectful to Nominatim
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function geocodeGolfClub(clubName: string, location: string): Promise<GeocodeResult> {
  try {
    // Wait 1 second between requests to respect Nominatim's usage policy
    await delay(1000);
    
    // Build search query - prioritize golf-specific terms
    const searchQuery = `${clubName} golf ${location} Sweden`;
    
    const params = new URLSearchParams({
      q: searchQuery,
      format: 'json',
      limit: '1',
      countrycodes: 'se', // Restrict to Sweden
      addressdetails: '1',
      'accept-language': 'sv,en' // Prefer Swedish, fallback to English
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`);
    
    if (!response.ok) {
      console.warn(`Geocoding failed for ${clubName}: HTTP ${response.status}`);
      return { latitude: 0, longitude: 0, success: false };
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        success: true
      };
    }
    
    console.warn(`No geocoding results found for ${clubName} in ${location}`);
    return { latitude: 0, longitude: 0, success: false };
    
  } catch (error) {
    console.error(`Geocoding error for ${clubName}:`, error);
    return { latitude: 0, longitude: 0, success: false };
  }
}

// Batch geocode function with progress tracking
export async function batchGeocodeGolfClubs(
  clubs: Array<{ name: string; location: string }>,
  onProgress?: (completed: number, total: number, current: string) => void
): Promise<Array<{ name: string; location: string; latitude: number; longitude: number; success: boolean }>> {
  const results = [];
  
  for (let i = 0; i < clubs.length; i++) {
    const club = clubs[i];
    
    if (onProgress) {
      onProgress(i, clubs.length, club.name);
    }
    
    const geocodeResult = await geocodeGolfClub(club.name, club.location);
    
    results.push({
      ...club,
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
      success: geocodeResult.success
    });
    
    // Log progress every 10 clubs
    if ((i + 1) % 10 === 0) {
      console.log(`Geocoded ${i + 1}/${clubs.length} golf clubs`);
    }
  }
  
  if (onProgress) {
    onProgress(clubs.length, clubs.length, 'Complete');
  }
  
  return results;
}

// Function to generate approximate coordinates based on city/region if exact geocoding fails
export function getApproximateCoordinates(location: string): { latitude: number; longitude: number } {
  // Major Swedish cities and regions with approximate coordinates
  const locationMap: { [key: string]: { lat: number; lng: number } } = {
    // Major cities
    'stockholm': { lat: 59.3293, lng: 18.0686 },
    'göteborg': { lat: 57.7089, lng: 11.9746 },
    'malmö': { lat: 55.6059, lng: 13.0007 },
    'uppsala': { lat: 59.8586, lng: 17.6389 },
    'västerås': { lat: 59.6099, lng: 16.5448 },
    'örebro': { lat: 59.2741, lng: 15.2066 },
    'linköping': { lat: 58.4108, lng: 15.6214 },
    'helsingborg': { lat: 56.0464, lng: 12.6945 },
    'jönköping': { lat: 57.7826, lng: 14.1618 },
    'norrköping': { lat: 58.5877, lng: 16.1924 },
    'lund': { lat: 55.7047, lng: 13.1910 },
    'umeå': { lat: 63.8258, lng: 20.2630 },
    'gävle': { lat: 60.6749, lng: 17.1413 },
    'borås': { lat: 57.7210, lng: 12.9401 },
    'eskilstuna': { lat: 59.3717, lng: 16.5077 },
    
    // Regions
    'skåne': { lat: 55.7, lng: 13.2 },
    'småland': { lat: 57.0, lng: 14.5 },
    'dalarna': { lat: 60.5, lng: 14.5 },
    'halland': { lat: 56.7, lng: 12.9 },
    'blekinge': { lat: 56.2, lng: 15.0 },
    'gotland': { lat: 57.5, lng: 18.5 },
    'västmanland': { lat: 59.6, lng: 16.5 },
    'värmland': { lat: 59.7, lng: 13.5 },
    'gävleborg': { lat: 61.0, lng: 17.0 },
    'västerbotten': { lat: 64.0, lng: 19.0 },
    'norrbotten': { lat: 66.5, lng: 20.0 },
    'jämtland': { lat: 63.0, lng: 14.5 },
    'västernorrland': { lat: 62.8, lng: 17.5 }
  };
  
  const locationLower = location.toLowerCase();
  
  // Try exact match first
  if (locationMap[locationLower]) {
    return { 
      latitude: locationMap[locationLower].lat, 
      longitude: locationMap[locationLower].lng 
    };
  }
  
  // Try partial matches
  for (const [key, coords] of Object.entries(locationMap)) {
    if (locationLower.includes(key) || key.includes(locationLower)) {
      return { 
        latitude: coords.lat, 
        longitude: coords.lng 
      };
    }
  }
  
  // Default to Stockholm if no match found
  return { latitude: 59.3293, longitude: 18.0686 };
}