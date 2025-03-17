interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    temp_f: number;
    condition: {
      text: string;
      code: number;
    };
    humidity: number;
    feelslike_f: number;
    uv: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_f: number;
        mintemp_f: number;
        avgtemp_f: number;
        condition: {
          text: string;
          code: number;
        };
      };
      hour: Array<{
        time: string;
        temp_f: number;
        condition: {
          text: string;
          code: number;
        };
      }>;
    }>;
  };
  history?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_f: number;
        mintemp_f: number;
        avgtemp_f: number;
        avghumidity: number;
        condition: {
          text: string;
          code: number;
        };
      };
      hour: Array<{
        time: string;
        temp_f: number;
        condition: {
          text: string;
          code: number;
        };
      }>;
    }>;
  };
}

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function getWeatherData(location: string): Promise<WeatherData> {
  try {
    if (!API_KEY) {
      console.error('API key is missing');
      throw new Error('Weather API key is not configured');
    }

    // Remove the /api/weather/ part
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

    // Use the same relative URL pattern for history
    const historyResponse = await fetch(
      `/api/weather/history.json?key=${API_KEY}&q=${encodeURIComponent(location)}&dt=${yesterdayStr}`,
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