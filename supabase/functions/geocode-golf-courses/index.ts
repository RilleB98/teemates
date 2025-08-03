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
    
    // Try multiple search queries for better results
    const searchQueries = [
      `${clubName} golf club ${location} Sweden`,
      `${clubName} golfklubb ${location} Sverige`,
      `${clubName} golf ${location}`,
      `${clubName} ${location} Sweden`,
      `golf ${location} Sweden`
    ];
    
    for (const query of searchQueries) {
      const encodedQuery = encodeURIComponent(query);
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=3&countrycodes=se`;
      
      try {
        const response = await fetch(nominatimUrl, {
          headers: {
            'User-Agent': 'Golf Club Locator App'
          }
        });
        
        if (!response.ok) {
          console.error(`Nominatim API error: ${response.status} for query: ${query}`);
          continue;
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Look for the best match (golf-related result)
          for (const result of data) {
            if (result.display_name.toLowerCase().includes('golf') || 
                result.display_name.toLowerCase().includes('golfklubb') ||
                result.type === 'recreation_ground' ||
                result.type === 'sport') {
              console.log(`Found golf-specific coordinates for ${clubName}: ${result.lat}, ${result.lon}`);
              return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                success: true
              };
            }
          }
          
          // If no golf-specific result, use the first result if it's in the right location
          const firstResult = data[0];
          if (firstResult.display_name.toLowerCase().includes(location.toLowerCase())) {
            console.log(`Found location-specific coordinates for ${clubName}: ${firstResult.lat}, ${firstResult.lon}`);
            return {
              latitude: parseFloat(firstResult.lat),
              longitude: parseFloat(firstResult.lon),
              success: true
            };
          }
        }
        
        // Small delay between queries
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (queryError) {
        console.error(`Error with query "${query}":`, queryError);
        continue;
      }
    }
    
    console.log(`No good results from Nominatim for ${clubName}, using location-based coordinates`);
    return getLocationBasedCoordinates(location);
  } catch (error) {
    console.error(`Error geocoding ${clubName}:`, error);
    return getLocationBasedCoordinates(location);
  }
}

// Improved function to get location-based coordinates with variations
function getLocationBasedCoordinates(location: string): GeocodeResult {
  const locationCoordinates: { [key: string]: { latitude: number; longitude: number } } = {
    // Major cities with slight variations to avoid clustering
    'Stockholm': { latitude: 59.3293 + Math.random() * 0.2 - 0.1, longitude: 18.0686 + Math.random() * 0.2 - 0.1 },
    'Göteborg': { latitude: 57.7089 + Math.random() * 0.1 - 0.05, longitude: 11.9746 + Math.random() * 0.1 - 0.05 },
    'Malmö': { latitude: 55.6050 + Math.random() * 0.1 - 0.05, longitude: 13.0038 + Math.random() * 0.1 - 0.05 },
    'Uppsala': { latitude: 59.8586 + Math.random() * 0.1 - 0.05, longitude: 17.6389 + Math.random() * 0.1 - 0.05 },
    'Västerås': { latitude: 59.6099 + Math.random() * 0.1 - 0.05, longitude: 16.5448 + Math.random() * 0.1 - 0.05 },
    'Örebro': { latitude: 59.2741 + Math.random() * 0.1 - 0.05, longitude: 15.2066 + Math.random() * 0.1 - 0.05 },
    'Linköping': { latitude: 58.4108 + Math.random() * 0.1 - 0.05, longitude: 15.6214 + Math.random() * 0.1 - 0.05 },
    'Helsingborg': { latitude: 56.0465 + Math.random() * 0.1 - 0.05, longitude: 12.6945 + Math.random() * 0.1 - 0.05 },
    'Jönköping': { latitude: 57.7826 + Math.random() * 0.1 - 0.05, longitude: 14.1618 + Math.random() * 0.1 - 0.05 },
    'Norrköping': { latitude: 58.5877 + Math.random() * 0.1 - 0.05, longitude: 16.1924 + Math.random() * 0.1 - 0.05 },
    'Lund': { latitude: 55.7047 + Math.random() * 0.05 - 0.025, longitude: 13.1910 + Math.random() * 0.05 - 0.025 },
    'Umeå': { latitude: 63.8258 + Math.random() * 0.1 - 0.05, longitude: 20.2630 + Math.random() * 0.1 - 0.05 },
    'Gävle': { latitude: 60.6749 + Math.random() * 0.1 - 0.05, longitude: 17.1413 + Math.random() * 0.1 - 0.05 },
    'Borås': { latitude: 57.7210 + Math.random() * 0.1 - 0.05, longitude: 12.9401 + Math.random() * 0.1 - 0.05 },
    'Eskilstuna': { latitude: 59.3717 + Math.random() * 0.1 - 0.05, longitude: 16.5077 + Math.random() * 0.1 - 0.05 },
    'Halmstad': { latitude: 56.6745 + Math.random() * 0.1 - 0.05, longitude: 12.8578 + Math.random() * 0.1 - 0.05 },
    'Växjö': { latitude: 56.8777 + Math.random() * 0.1 - 0.05, longitude: 14.8091 + Math.random() * 0.1 - 0.05 },
    'Karlstad': { latitude: 59.3793 + Math.random() * 0.1 - 0.05, longitude: 13.5036 + Math.random() * 0.1 - 0.05 },
    'Sundsvall': { latitude: 62.3908 + Math.random() * 0.1 - 0.05, longitude: 17.3069 + Math.random() * 0.1 - 0.05 },
    'Trollhättan': { latitude: 58.2837 + Math.random() * 0.1 - 0.05, longitude: 12.2886 + Math.random() * 0.1 - 0.05 },
    'Östersund': { latitude: 63.1792 + Math.random() * 0.1 - 0.05, longitude: 14.6357 + Math.random() * 0.1 - 0.05 },
    'Borlänge': { latitude: 60.4858 + Math.random() * 0.1 - 0.05, longitude: 15.4356 + Math.random() * 0.1 - 0.05 },
    'Falun': { latitude: 60.6066 + Math.random() * 0.1 - 0.05, longitude: 15.6256 + Math.random() * 0.1 - 0.05 },
    'Skövde': { latitude: 58.3906 + Math.random() * 0.1 - 0.05, longitude: 13.8456 + Math.random() * 0.1 - 0.05 },
    'Karlskrona': { latitude: 56.1612 + Math.random() * 0.1 - 0.05, longitude: 15.5869 + Math.random() * 0.1 - 0.05 },
    'Kristianstad': { latitude: 56.0294 + Math.random() * 0.1 - 0.05, longitude: 14.1567 + Math.random() * 0.1 - 0.05 },
    'Kalmar': { latitude: 56.6634 + Math.random() * 0.1 - 0.05, longitude: 16.3567 + Math.random() * 0.1 - 0.05 },
    'Visby': { latitude: 57.6348 + Math.random() * 0.1 - 0.05, longitude: 18.2948 + Math.random() * 0.1 - 0.05 }
  };

  // Try to find a match for the location
  for (const [city, coords] of Object.entries(locationCoordinates)) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      return { ...coords, success: false };
    }
  }

  // Default to Stockholm area with variation if no match found
  return { 
    latitude: 59.3293 + Math.random() * 0.2 - 0.1, 
    longitude: 18.0686 + Math.random() * 0.2 - 0.1, 
    success: false 
  };
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

    // Fetch golf courses that need re-geocoding (duplicated coordinates or 0,0)
    const { data: courses, error: fetchError } = await supabase
      .from('golf_courses')
      .select('*')
      .or('latitude.eq.0,longitude.eq.0,latitude.eq.57.7089,latitude.eq.59.3485505,latitude.eq.55.6059,latitude.eq.55.605');

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