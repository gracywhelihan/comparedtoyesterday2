import type { WeatherData } from '@/types/weather';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function getWeatherData(location: string): Promise<WeatherData> {
  try {
    // Use BASE_URL for forecast
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=7`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // Get yesterday's weather
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    // Use BASE_URL for history
    const historyResponse = await fetch(
      `${BASE_URL}/history.json?key=${API_KEY}&q=${encodeURIComponent(location)}&dt=${yesterdayStr}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      data.history = historyData.forecast;
    }

    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

export async function getLocationCoordinates(city: string) {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Location fetch failed');
    }

    const data = await response.json();
    if (data.length === 0) {
      throw new Error('Location not found');
    }

    return {
      lat: data[0].lat,
      lon: data[0].lon,
      name: data[0].name,
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    throw error;
  }
}