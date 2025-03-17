import { useState, useEffect } from 'react';
import { getWeatherData } from '@/lib/weatherService';
import type { WeatherData } from '@/types/weather';

export function useWeather(defaultCity: string = 'London') {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>(defaultCity);
  const [usingGeolocation, setUsingGeolocation] = useState(false);

  const getLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error('Unable to get location: ' + error.message));
        },
        { timeout: 10000 } // 10 second timeout
      );
    });
  };

  const fetchWeather = async (useGeolocation: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      if (useGeolocation) {
        const coords = await getLocation();
        const data = await getWeatherData(`${coords.lat},${coords.lon}`);
        setWeatherData(data);
        setLocation(data.location.name);
        setUsingGeolocation(true);
      } else {
        const data = await getWeatherData(location);
        setWeatherData(data);
        setUsingGeolocation(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch using geolocation
  useEffect(() => {
    fetchWeather(true).catch(() => {
      // Fallback to default city if geolocation fails
      fetchWeather(false);
    });
  }, []);

  // Fetch when location changes manually
  useEffect(() => {
    if (!usingGeolocation) {
      fetchWeather(false);
    }
  }, [location, usingGeolocation]);

  return {
    weatherData,
    loading,
    error,
    location,
    setLocation,
    refetch: () => fetchWeather(usingGeolocation),
    useGeolocation: () => fetchWeather(true),
  };
}