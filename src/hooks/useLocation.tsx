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
  const [watchId, setWatchId] = useState<string | null>(null);

  // Load saved location preference and start live tracking if enabled
  useEffect(() => {
    const initializeLocation = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('location_enabled, last_location')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data?.location_enabled) {
          // If location was previously enabled, start live tracking automatically
          await startLiveTracking();
        } else if (data?.last_location && 
            typeof data.last_location === 'object' && 
            data.last_location !== null &&
            !Array.isArray(data.last_location)) {
          // Load last known location as fallback
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

    initializeLocation();

    // Cleanup on unmount
    return () => {
      if (watchId) {
        stopLiveTracking();
      }
    };
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

  
  const startLiveTracking = async () => {
    if (watchId) return; // Already tracking

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Check permissions first
      const permissions = await Geolocation.checkPermissions();
      
      if (permissions.location !== 'granted') {
        const permissionRequest = await Geolocation.requestPermissions();
        
        if (permissionRequest.location !== 'granted') {
          throw new Error('Platstillstånd krävs för live GPS-spårning');
        }
      }

      // Start watching position
      const id = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Use cached position for up to 30 seconds
      }, (position) => {
        if (position) {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          setState({
            location: newLocation,
            loading: false,
            error: null
          });

          // Save updated location
          saveLocationPreference(newLocation);
        }
      });

      setWatchId(id);
      
    } catch (error) {
      // Fallback to browser geolocation
      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation stöds inte av din webbläsare');
        }

        const id = navigator.geolocation.watchPosition(
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

            await saveLocationPreference(newLocation);
          },
          (error) => {
            let errorMessage = 'Kunde inte spåra din plats';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Platstillstånd nekades. Aktivera platsdelning i dina inställningar.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Platsinformation är inte tillgänglig.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Timeout - kunde inte spåra din plats.';
                break;
            }
            setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
          }
        );

        setWatchId(id.toString());
        
      } catch (fallbackError) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Kunde inte starta live GPS-spårning' 
        }));
      }
    }
  };

  const stopLiveTracking = async () => {
    if (!watchId) return;

    try {
      // Try Capacitor first
      await Geolocation.clearWatch({ id: watchId });
    } catch (error) {
      // Fallback to browser geolocation
      navigator.geolocation.clearWatch(parseInt(watchId));
    }
    
    setWatchId(null);
  };

  const getCurrentPosition = async () => {
    // Start live tracking instead of just getting current position
    await startLiveTracking();
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