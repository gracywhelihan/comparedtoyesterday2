interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

interface HourData {
  time: string;
  temp_f: number;
  condition: WeatherCondition;
  chance_of_rain: number;
  chance_of_snow: number;
}

interface DayData {
  avgtemp_f: number;
  maxtemp_f: number;
  mintemp_f: number;
  condition: WeatherCondition;
  daily_chance_of_rain: number;
  daily_chance_of_snow: number;
  avghumidity: number;
}

interface CurrentData {
  temp_f: number;
  temp_c: number;
  condition: WeatherCondition;
  feelslike_f: number;
  humidity: number;
  wind_mph: number;
  uv: number;
}

interface Astro {
  sunrise: string;
  sunset: string;
}

interface ForecastDay {
  date: string;
  day: DayData;
  hour: HourData[];
  astro: Astro;
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: CurrentData;
  forecast: {
    forecastday: ForecastDay[];
  };
  history?: {
    forecastday: Array<{
      day: DayData;
      hour: HourData[];
    }>;
  };
}