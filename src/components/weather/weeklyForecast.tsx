import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Cloudy, Wind } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { WeatherData } from "@/types/weather"

interface WeeklyForecastProps {
  weatherData: WeatherData;
}

function formatDay(date: string, timezone: string): string {
  // Create a date object and adjust for the timezone
  const localDate = new Date(date + 'T00:00:00');
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long',
    timeZone: timezone 
  };
  return localDate.toLocaleDateString('en-US', options);
}

function getWeatherIcon(code: number) {
  const iconClass = "h-5 w-5"
  if (code === 1000) return <Sun className={`${iconClass} text-yellow-500`} />
  if (code >= 1063 && code <= 1171) return <CloudRain className={`${iconClass} text-blue-500`} />
  if (code >= 1200 && code <= 1237) return <CloudSnow className={`${iconClass} text-blue-200`} />
  if (code >= 1273 && code <= 1282) return <CloudLightning className={`${iconClass} text-yellow-600`} />
  if (code >= 1087 && code <= 1117) return <Wind className={`${iconClass} text-slate-500`} />
  if (code >= 1003 && code <= 1030) return <Cloud className={`${iconClass} text-gray-400`} />
  return <Cloudy className={`${iconClass} text-gray-400`} />
}

export function WeeklyForecast({ weatherData }: WeeklyForecastProps) {
  console.log('All forecast days:', weatherData.forecast.forecastday.map(day => ({
    date: day.date,
    day: formatDay(day.date, weatherData.location.tz_id)
  })));
  
  // Get future days only (skip today)
  const futureForecast = weatherData.forecast.forecastday.slice(1);
  console.log('Future forecast days:', futureForecast.map(day => ({
    date: day.date,
    day: formatDay(day.date, weatherData.location.tz_id)
  })));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">2-Day Forecast</h3>
      <Card>
        <div className="divide-y">
          {futureForecast.map((day) => (
            <div key={day.date} className="flex items-center justify-between p-4">
              <div className="w-28 font-medium">
                {formatDay(day.date, weatherData.location.tz_id)}
              </div>
              {getWeatherIcon(day.day.condition.code)}
              <div className="flex w-20 items-center justify-end gap-2">
                <span className="text-sm font-medium">{Math.round(day.day.maxtemp_f)}°</span>
                <span className="text-sm text-muted-foreground">{Math.round(day.day.mintemp_f)}°</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

