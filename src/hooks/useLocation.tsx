import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationState {
  location: Location | null;
  loading: boolean;
  error: string | null;
}

export const useLocation = () => {
  const { user } = useAuth();
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null
  });

  // Load saved location preference on mount
  useEffect(() => {
    const loadLocationPreference = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('location_enabled, last_location')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.location_enabled && data?.last_location && 
            typeof data.last_location === 'object' && 
            data.last_location !== null &&
            !Array.isArray(data.last_location)) {
          const locationData = data.last_location as Record<string, any>;
          if ('latitude' in locationData && 'longitude' in locationData) {
            setState(prev => ({
              ...prev,
              location: {
                latitude: locationData.latitude as number,
                longitude: locationData.longitude as number
              }
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load location preference:', error);
      }
    };

    loadLocationPreference();
  }, [user]);

  const saveLocationPreference = async (location: Location) => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          location_enabled: true,
          last_location: JSON.parse(JSON.stringify(location))
        });
    } catch (error) {
      console.error('Failed to save location preference:', error);
    }
  };

  const getCurrentPosition = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // First try to get permission
      const permissions = await Geolocation.checkPermissions();
      
      if (permissions.location !== 'granted') {
        const permissionRequest = await Geolocation.requestPermissions();
        
        if (permissionRequest.location !== 'granted') {
          throw new Error('Platstillstånd krävs för att hitta närliggande golfbanor');
        }
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setState({
        location: newLocation,
        loading: false,
        error: null
      });

      // Save location preference
      await saveLocationPreference(newLocation);

    } catch (error) {
      // Fallback to browser geolocation if Capacitor fails
      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation stöds inte av din webbläsare');
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            
            setState({
              location: newLocation,
              loading: false,
              error: null
            });

            // Save location preference
            await saveLocationPreference(newLocation);
          },
          (error) => {
            let errorMessage = 'Kunde inte hämta din plats';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Platstillstånd nekades. Aktivera platsdelning i dina inställningar.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Platsinformation är inte tillgänglig.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Timeout - kunde inte hämta din plats.';
                break;
            }
            setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } catch (fallbackError) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Kunde inte hämta din plats' 
        }));
      }
    }
  };

  // Calculate distance between two coordinates (in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return {
    ...state,
    getCurrentPosition,
    calculateDistance
  };
};