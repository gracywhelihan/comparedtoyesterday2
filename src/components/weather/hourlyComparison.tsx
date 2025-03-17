import React from "react"
import { Sun, Cloud, Moon, CloudRain, CloudSnow, CloudLightning, Droplets, Snowflake, Wind } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { WeatherData } from "@/types/weather"

interface HourlyComparisonProps {
  weatherData: WeatherData;
}

// Helper function to format hour (e.g., "2 PM", "11 AM")
function formatHour(timeString: string): string {
  const hour = new Date(timeString).getHours()
  if (hour === new Date().getHours()) return "NOW"
  return `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`
}

// Helper function to get weather icon and its color
function getWeatherIcon(code: number, isNight: boolean) {
  // Define icon and color based on condition
  const iconConfig = {
    icon: Cloud, // default
    className: "h-5 w-5 text-gray-400" // default cloud color
  }

  // Basic night check
  if (isNight && code === 1000) {
    iconConfig.icon = Moon
    iconConfig.className = "h-5 w-5 text-slate-300"
    return iconConfig
  }

  // Weather conditions
  if (code === 1000) {
    iconConfig.icon = Sun
    iconConfig.className = "h-5 w-5 text-yellow-500"
  }
  else if (code >= 1063 && code <= 1171) {
    iconConfig.icon = CloudRain
    iconConfig.className = "h-5 w-5 text-blue-500"
  }
  else if (code >= 1200 && code <= 1237) {
    iconConfig.icon = CloudSnow
    iconConfig.className = "h-5 w-5 text-blue-200"
  }
  else if (code >= 1273 && code <= 1282) {
    iconConfig.icon = CloudLightning
    iconConfig.className = "h-5 w-5 text-yellow-600"
  }
  else if (code >= 1087 && code <= 1117) {
    iconConfig.icon = Wind
    iconConfig.className = "h-5 w-5 text-slate-500"
  }
  else if (code >= 1003 && code <= 1030) {
    iconConfig.icon = Cloud
    iconConfig.className = "h-5 w-5 text-gray-400"
  }

  return iconConfig
}

// Helper function to render precipitation chance
function PrecipChance({ rainChance, snowChance, className = "" }: { 
  rainChance: number, 
  snowChance: number,
  className?: string 
}) {
  if (rainChance === 0 && snowChance === 0) return null;

  // If both chances are high, it's likely a mixed precipitation
  if (rainChance > 0 && snowChance > 0) {
    return (
      <div className={`flex items-center gap-1 text-xs ${className}`}>
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3" />
          <Snowflake className="h-3 w-3" />
          <span>Mixed {Math.max(rainChance, snowChance)}%</span>
        </div>
      </div>
    );
  }

  // Show only rain or snow if just one type is present
  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      {rainChance > 0 && (
        <div className="flex items-center gap-1">
          <Droplets className="h-3 w-3" />
          <span>{rainChance}%</span>
        </div>
      )}
      {snowChance > 0 && (
        <div className="flex items-center gap-1">
          <Snowflake className="h-3 w-3" />
          <span>{snowChance}%</span>
        </div>
      )}
    </div>
  );
}

export function HourlyComparison({ weatherData }: HourlyComparisonProps) {
  const today = weatherData.forecast.forecastday[0];
  const yesterday = weatherData.history?.forecastday[0];
  
  // Get current hour to determine which hours to display
  const currentHour = new Date().getHours();
  const hours = today.hour.slice(currentHour, currentHour + 24);
  
  // If we need more hours, add from tomorrow
  if (hours.length < 24 && weatherData.forecast.forecastday[1]) {
    const tomorrowHours = weatherData.forecast.forecastday[1].hour.slice(0, 24 - hours.length);
    hours.push(...tomorrowHours);
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="inline-flex min-w-full">
          {hours.map((hour, index) => {
            const time = formatHour(hour.time);
            const isNight = new Date(hour.time).getHours() >= 20 || new Date(hour.time).getHours() < 6;
            const yesterdayHour = yesterday?.hour?.[new Date(hour.time).getHours()];
            const hasCurrentPrecip = hour.chance_of_rain > 0 || hour.chance_of_snow > 0;
            const hasYesterdayPrecip = yesterdayHour && (yesterdayHour.chance_of_rain > 0 || yesterdayHour.chance_of_snow > 0);
            
            const todayIcon = getWeatherIcon(hour.condition.code, isNight);
            const yesterdayIcon = yesterdayHour && getWeatherIcon(yesterdayHour.condition.code, isNight);

            return (
              <div key={index} className="w-20 flex-none border-r bg-background last:border-r-0">
                <div className="border-b p-2 text-center font-medium">{time}</div>
                <div className={`h-[120px] flex flex-col items-center p-2 ${hasCurrentPrecip ? 'justify-between' : 'justify-around'}`}>
                  <div className="text-xs font-medium text-muted-foreground">Today</div>
                  <div className="flex flex-col items-center gap-1">
                    {React.createElement(
                      todayIcon.icon,
                      { className: todayIcon.className }
                    )}
                    <div>{Math.round(hour.temp_f)}°</div>
                  </div>
                  <PrecipChance 
                    rainChance={hour.chance_of_rain}
                    snowChance={hour.chance_of_snow}
                    className="text-blue-500"
                  />
                </div>
                <div className={`h-[120px] flex flex-col items-center bg-muted/50 p-2 ${hasYesterdayPrecip ? 'justify-between' : 'justify-around'}`}>
                  <div className="text-xs font-medium text-muted-foreground">Yesterday</div>
                  <div className="flex flex-col items-center gap-1">
                    {yesterdayIcon && React.createElement(
                      yesterdayIcon.icon,
                      { className: yesterdayIcon.className }
                    )}
                    <div className="text-muted-foreground">
                      {yesterdayHour ? `${Math.round(yesterdayHour.temp_f)}°` : '--'}
                    </div>
                  </div>
                  {yesterdayHour && (
                    <PrecipChance 
                      rainChance={yesterdayHour.chance_of_rain}
                      snowChance={yesterdayHour.chance_of_snow}
                      className="text-muted-foreground"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  )
}

