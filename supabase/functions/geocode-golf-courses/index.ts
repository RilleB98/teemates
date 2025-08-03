import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  success: boolean;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

// Rate limiting to be respectful to Nominatim
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeGolfClub(clubName: string, location: string): Promise<GeocodeResult> {
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

// Function to generate approximate coordinates based on city/region if exact geocoding fails
function getApproximateCoordinates(location: string): { latitude: number; longitude: number } {
  const locationMap: { [key: string]: { lat: number; lng: number } } = {
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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get all golf courses that need geocoding (latitude = 0 or longitude = 0)
    const { data: courses, error: fetchError } = await supabase
      .from('golf_courses')
      .select('*')
      .or('latitude.eq.0,longitude.eq.0');

    if (fetchError) {
      console.error('Error fetching courses:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch courses' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found ${courses?.length || 0} courses that need geocoding`);

    const results = [];
    let processed = 0;

    for (const course of courses || []) {
      console.log(`Geocoding ${course.name} in ${course.location} (${processed + 1}/${courses.length})`);
      
      const geocodeResult = await geocodeGolfClub(course.name, course.location);
      
      let finalLatitude = geocodeResult.latitude;
      let finalLongitude = geocodeResult.longitude;
      
      // If geocoding failed, use approximate coordinates
      if (!geocodeResult.success) {
        const approxCoords = getApproximateCoordinates(course.location);
        finalLatitude = approxCoords.latitude;
        finalLongitude = approxCoords.longitude;
        console.log(`Using approximate coordinates for ${course.name}: ${finalLatitude}, ${finalLongitude}`);
      }

      // Update the course in the database
      const { error: updateError } = await supabase
        .from('golf_courses')
        .update({
          latitude: finalLatitude,
          longitude: finalLongitude
        })
        .eq('id', course.id);

      if (updateError) {
        console.error(`Error updating course ${course.name}:`, updateError);
      } else {
        console.log(`Successfully updated ${course.name} with coordinates: ${finalLatitude}, ${finalLongitude}`);
      }

      results.push({
        name: course.name,
        location: course.location,
        latitude: finalLatitude,
        longitude: finalLongitude,
        success: geocodeResult.success,
        updated: !updateError
      });
      
      processed++;
      
      // Log progress every 10 courses
      if (processed % 10 === 0) {
        console.log(`Geocoded ${processed}/${courses.length} golf courses`);
      }
    }

    console.log(`Geocoding complete! Processed ${processed} courses`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully geocoded ${processed} golf courses`,
        results: results,
        stats: {
          total: courses.length,
          processed: processed,
          successful: results.filter(r => r.success).length,
          approximate: results.filter(r => !r.success).length
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in geocode function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});