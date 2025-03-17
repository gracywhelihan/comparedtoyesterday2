import { useWeather } from "@/hooks/useWeather"
import { Card } from "@/components/ui/card"
import { WeatherComparison } from "@/components/weather/weatherComparison"
import { HourlyComparison } from "@/components/weather/hourlyComparison"
import { WeeklyForecast } from "@/components/weather/weeklyForecast"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCcw, Navigation2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Helper function to get condition-based gradient classes
function getConditionGradient(tempDiff: number, windSpeed: number): {
  background: string;
  text: string;
} {
  // If it's significantly windy (over 15mph), prioritize wind colors
  if (windSpeed > 15) {
    return {
      background: "from-slate-50 to-gray-100 dark:from-slate-900/20 dark:to-gray-800/20",
      text: "from-slate-600 to-gray-600 dark:from-slate-400 dark:to-gray-400"
    };
  }
  
  // Temperature difference gradients
  if (tempDiff > 5) {
    // Much warmer (yellow/orange)
    return {
      background: "from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20",
      text: "from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400"
    };
  } else if (tempDiff > 0) {
    // Slightly warmer (light yellow)
    return {
      background: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
      text: "from-yellow-600 to-yellow-600 dark:from-yellow-400 dark:to-yellow-400"
    };
  } else if (tempDiff < -5) {
    // Much colder (deep blue)
    return {
      background: "from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20",
      text: "from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
    };
  } else if (tempDiff < 0) {
    // Slightly colder (light blue)
    return {
      background: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
      text: "from-blue-600 to-blue-600 dark:from-blue-400 dark:to-blue-400"
    };
  }
  
  // Similar temperature (neutral)
  return {
    background: "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
    text: "from-gray-600 to-gray-600 dark:from-gray-400 dark:to-gray-400"
  };
}

export default function WeatherPage() {
  const { 
    weatherData, 
    loading, 
    error, 
    refetch, 
    location,
    useGeolocation 
  } = useWeather("New York")

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <Card className="mx-auto max-w-2xl space-y-6 p-6">
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-8 w-40" />
            <Skeleton className="mx-auto h-4 w-60" />
          </div>
          <Skeleton className="h-32 w-full" />
          <div>
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div>
            <Skeleton className="mb-2 h-6 w-40" />
            <Skeleton className="h-64 w-full" />
          </div>
        </Card>
      </div>
    )
  }

  // Error state with retry button
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="mx-auto max-w-2xl p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={refetch} 
            className="mt-4 w-full"
            variant="outline"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  if (!weatherData) return null

  const currentCondition = weatherData.current.condition.text || '';
  
  const getComparisonText = (current: number, yesterday: number) => {
    const diff = current - yesterday;
    if (Math.abs(diff) < 2) return "Similar";
    return diff > 0 ? "Warmer" : "Cooler";
  };

  const tempDiff = weatherData ? 
    weatherData.current.temp_f - (weatherData.history?.forecastday[0]?.hour[new Date().getHours()]?.temp_f || 0)
    : 0;

  const gradient = weatherData ? 
    getConditionGradient(tempDiff, weatherData.current.wind_mph) 
    : { background: "", text: "" };

  const comparisonText = weatherData ? 
    getComparisonText(
      weatherData.current.temp_f,
      weatherData.history?.forecastday[0]?.hour[new Date().getHours()]?.temp_f ?? 0
    )
    : "";

  return (
    <div className="container max-w-2xl space-y-2 sm:space-y-4 p-2 sm:pt-4">
      <div className="flex items-center justify-center gap-4">
        <h1 className="text-2xl sm:text-4xl font-bold">{location}</h1>
        <Button 
          onClick={useGeolocation} 
          variant="outline" 
          size="sm"
          className="gap-1 sm:gap-2 text-xs sm:text-sm"
          title="Update location and weather"
        >
          <Navigation2 className="h-3 w-3 sm:h-4 sm:w-4" />
          Update
        </Button>
      </div>

      {weatherData && (
        <div className={`rounded-lg bg-gradient-to-r ${gradient.background} p-2 sm:p-4 text-center`}>
          <h2 className={`text-xl sm:text-3xl font-semibold bg-gradient-to-r ${gradient.text} bg-clip-text text-transparent`}>
            {comparisonText} & {currentCondition} today
          </h2>
        </div>
      )}
      
      {weatherData && (
        <div className="space-y-2 sm:space-y-4">
          <WeatherComparison weatherData={weatherData} />
          <HourlyComparison weatherData={weatherData} />
          <WeeklyForecast weatherData={weatherData} />
        </div>
      )}
    </div>
  )
}
