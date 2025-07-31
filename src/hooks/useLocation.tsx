import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';

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
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null
  });

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

      setState({
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        loading: false,
        error: null
      });

    } catch (error) {
      // Fallback to browser geolocation if Capacitor fails
      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation stöds inte av din webbläsare');
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setState({
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              },
              loading: false,
              error: null
            });
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