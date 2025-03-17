import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Cloudy, Droplets, Sunrise, Sunset, Wind } from "lucide-react"
import type { WeatherData } from "@/types/weather"

interface WeatherComparisonProps {
  weatherData: WeatherData;
}

// Helper function to get UV index color
function getUVIndexColor(uv: number): string {
  if (uv >= 11) return "text-purple-500 dark:text-purple-400"; // Extreme
  if (uv >= 8) return "text-red-500 dark:text-red-400";       // Very High
  if (uv >= 6) return "text-orange-500 dark:text-orange-400"; // High
  if (uv >= 3) return "text-yellow-500 dark:text-yellow-400"; // Moderate
  return "text-green-500 dark:text-green-400";                // Low
}

// Helper function to get the appropriate weather icon based on condition code
function getWeatherIcon(code: number) {
  // WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
  if (code === 1000) return <Sun className="h-6 w-6" /> // Clear
  if (code >= 1063 && code <= 1171) return <CloudRain className="h-6 w-6" /> // Rain
  if (code >= 1200 && code <= 1237) return <CloudSnow className="h-6 w-6" /> // Snow
  if (code >= 1273 && code <= 1282) return <CloudLightning className="h-6 w-6" /> // Thunder
  if (code >= 1003 && code <= 1030) return <Cloud className="h-6 w-6" /> // Cloudy
  if (code >= 1180 && code <= 1201) return <Wind className="h-6 w-6" /> // Wind
  return <Cloudy className="h-6 w-6" />
}

export function WeatherComparison({ weatherData }: WeatherComparisonProps) {
  const { current, forecast } = weatherData;
  const today = forecast.forecastday[0];
  const yesterday = weatherData.history?.forecastday[0];
  
  const currentHour = new Date().getHours();
  const yesterdayTemp = yesterday?.hour?.[currentHour]?.temp_f;
  
  // Fix the feelslike_c access
  const yesterdayFeelsLike = yesterday?.hour?.[currentHour]?.temp_f 
    ? Math.round(yesterday.hour[currentHour].temp_f) 
    : '--';

  return (
    <div className="space-y-2 sm:space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
        <div className="flex flex-col space-y-1 sm:space-y-2 sm:justify-center sm:min-h-[300px]">
          <h2 className="text-base sm:text-lg font-medium text-muted-foreground">Yesterday</h2>
          <div className="text-2xl sm:text-3xl font-bold text-muted-foreground">
            {yesterdayTemp ? Math.round(yesterdayTemp) : '--'}°
          </div>
          <div className="flex items-center justify-center gap-1 text-xs sm:text-sm text-muted-foreground">
            {yesterday && getWeatherIcon(yesterday.day.condition.code)}
            <span>{yesterday?.day.condition.text || 'No data'}</span>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Avg Temp: {yesterday ? Math.round(yesterday.day.avgtemp_f) : '--'}°
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Felt like: {yesterdayFeelsLike}°
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            High: {yesterday ? Math.round(yesterday.day.maxtemp_f) : '--'}° 
            Low: {yesterday ? Math.round(yesterday.day.mintemp_f) : '--'}°
          </div>
          <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
            <Droplets className="h-3 w-3" />
            <span>Humidity: {yesterday?.day.avghumidity || '--'}%</span>
          </div>
        </div>
        <div className="col-span-2 bg-muted/50 rounded-lg p-2 sm:p-4">
          <h2 className="text-base sm:text-lg font-medium">Today</h2>
          <div className="text-4xl sm:text-6xl font-bold">
            {Math.round(current.temp_f)}°
          </div>
          <div className="flex items-center justify-center gap-2 text-base sm:text-lg">
            {getWeatherIcon(current.condition.code)}
            <span>{current.condition.text}</span>
          </div>
          <div className="text-sm sm:text-base">
            Feels like: {Math.round(current.feelslike_f)}°
          </div>
          <div className="text-sm sm:text-base">
            High: {Math.round(today.day.maxtemp_f)}° Low: {Math.round(today.day.mintemp_f)}°
          </div>
          <div className="text-sm sm:text-base">
            UV Index: <span className={getUVIndexColor(current.uv)}>{current.uv}</span>
          </div>
          <div className="flex items-center justify-center gap-1 text-sm sm:text-base">
            <Droplets className="h-4 w-4" />
            <span>Humidity: {current.humidity}%</span>
          </div>
          
          <div className="flex justify-center gap-4 mt-2 text-sm sm:text-base">
            <div className="flex items-center gap-1">
              <Sunrise className="h-4 w-4 text-orange-400" />
              {today.astro.sunrise}
            </div>
            <div className="flex items-center gap-1">
              <Sunset className="h-4 w-4 text-orange-400" />
              {today.astro.sunset}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}