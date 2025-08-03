import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  success: boolean;
}

// Function to geocode a single golf club using Nominatim API
async function geocodeGolfClub(clubName: string, location: string): Promise<GeocodeResult> {
  try {
    console.log(`Geocoding: ${clubName} in ${location}`);
    
    // Add a small delay to respect Nominatim rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const query = encodeURIComponent(`${clubName} golf ${location} Sweden`);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=se`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Golf Club Locator App'
      }
    });
    
    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status} for ${clubName}`);
      return getApproximateCoordinates(location);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      console.log(`Found coordinates for ${clubName}: ${result.lat}, ${result.lon}`);
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        success: true
      };
    } else {
      console.log(`No results from Nominatim for ${clubName}, using approximate coordinates`);
      return getApproximateCoordinates(location);
    }
  } catch (error) {
    console.error(`Error geocoding ${clubName}:`, error);
    return getApproximateCoordinates(location);
  }
}

// Fallback function to get approximate coordinates for Swedish locations
function getApproximateCoordinates(location: string): { latitude: number; longitude: number } {
  const approximateCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
    'Stockholm': { latitude: 59.3293, longitude: 18.0686 },
    'Göteborg': { latitude: 57.7089, longitude: 11.9746 },
    'Malmö': { latitude: 55.6050, longitude: 13.0038 },
    'Uppsala': { latitude: 59.8586, longitude: 17.6389 },
    'Västerås': { latitude: 59.6099, longitude: 16.5448 },
    'Örebro': { latitude: 59.2741, longitude: 15.2066 },
    'Linköping': { latitude: 58.4108, longitude: 15.6214 },
    'Helsingborg': { latitude: 56.0465, longitude: 12.6945 },
    'Jönköping': { latitude: 57.7826, longitude: 14.1618 },
    'Norrköping': { latitude: 58.5877, longitude: 16.1924 },
    'Lund': { latitude: 55.7047, longitude: 13.1910 },
    'Umeå': { latitude: 63.8258, longitude: 20.2630 },
    'Gävle': { latitude: 60.6749, longitude: 17.1413 },
    'Borås': { latitude: 57.7210, longitude: 12.9401 },
    'Eskilstuna': { latitude: 59.3717, longitude: 16.5077 },
    'Halmstad': { latitude: 56.6745, longitude: 12.8578 },
    'Växjö': { latitude: 56.8777, longitude: 14.8091 },
    'Karlstad': { latitude: 59.3793, longitude: 13.5036 },
    'Sundsvall': { latitude: 62.3908, longitude: 17.3069 },
    'Trollhättan': { latitude: 58.2837, longitude: 12.2886 },
    'Östersund': { latitude: 63.1792, longitude: 14.6357 },
    'Borlänge': { latitude: 60.4858, longitude: 15.4356 },
    'Falun': { latitude: 60.6066, longitude: 15.6256 },
    'Skövde': { latitude: 58.3906, longitude: 13.8456 },
    'Karlskrona': { latitude: 56.1612, longitude: 15.5869 },
    'Kristianstad': { latitude: 56.0294, longitude: 14.1567 },
    'Kalmar': { latitude: 56.6634, longitude: 16.3567 },
    'Växjö': { latitude: 56.8777, longitude: 14.8091 },
    'Visby': { latitude: 57.6348, longitude: 18.2948 }
  };

  // Try to find a match for the location
  for (const [city, coords] of Object.entries(approximateCoordinates)) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }

  // Default to Stockholm if no match found
  return approximateCoordinates['Stockholm'];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting geocoding process for golf courses...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch golf courses that need geocoding (latitude = 0 OR longitude = 0)
    const { data: courses, error: fetchError } = await supabase
      .from('golf_courses')
      .select('*')
      .or('latitude.eq.0,longitude.eq.0');

    if (fetchError) {
      console.error('Error fetching golf courses:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${courses?.length || 0} golf courses that need geocoding`);

    if (!courses || courses.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No golf courses need geocoding',
          stats: { total: 0, successful: 0, approximate: 0 },
          results: []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const results = [];
    let successful = 0;
    let approximate = 0;

    // Process each course
    for (const course of courses) {
      console.log(`Processing: ${course.name}`);
      
      // Get coordinates
      const geocodeResult = await geocodeGolfClub(course.name, course.location);
      
      if (!geocodeResult.success) {
        approximate++;
      } else {
        successful++;
      }

      // Update the database
      const { error: updateError } = await supabase
        .from('golf_courses')
        .update({
          latitude: geocodeResult.latitude,
          longitude: geocodeResult.longitude,
          updated_at: new Date().toISOString()
        })
        .eq('id', course.id);

      if (updateError) {
        console.error(`Error updating course ${course.name}:`, updateError);
      } else {
        console.log(`Updated ${course.name} with coordinates: ${geocodeResult.latitude}, ${geocodeResult.longitude}`);
      }

      results.push({
        name: course.name,
        location: course.location,
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        success: geocodeResult.success
      });
    }

    const stats = {
      total: courses.length,
      successful,
      approximate
    };

    console.log('Geocoding completed:', stats);

    return new Response(
      JSON.stringify({
        message: `Geocoding completed. Processed ${courses.length} golf courses.`,
        stats,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Geocoding error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        message: 'Failed to geocode golf courses'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});