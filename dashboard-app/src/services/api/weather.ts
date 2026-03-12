import axios from "axios";
import type { WeatherCurrent, WeatherForecast } from "../../types/weather.types";

const BASE_URL = "https://api.openweathermap.org/data/2.5";

function getApiKey(): string {
  const key = import.meta.env.VITE_WEATHER_API_KEY as string | undefined;
  if (!key) throw new Error("VITE_WEATHER_API_KEY is not set");
  return key;
}

const client = axios.create({ baseURL: BASE_URL });

// ─── Current weather ──────────────────────────────────────────────────────────

export async function fetchCurrentWeather(
  city: string,
  units: "metric" | "imperial" = "metric"
): Promise<WeatherCurrent> {
  const { data } = await client.get("/weather", {
    params: { q: city, units, appid: getApiKey() },
  });

  return {
    city: data.name,
    country: data.sys.country,
    temp: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    description: data.weather[0].description,
    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    timestamp: data.dt * 1000,
  };
}

// ─── 5-day / 3-hour forecast ──────────────────────────────────────────────────

export async function fetchForecast(
  city: string,
  units: "metric" | "imperial" = "metric"
): Promise<WeatherForecast> {
  const { data } = await client.get("/forecast", {
    params: { q: city, units, appid: getApiKey() },
  });

  // Condense to one entry per calendar day (the noon-est slot)
  const byDay: Record<string, (typeof data.list)[0]> = {};
  for (const entry of data.list as { dt: number; main: { temp: number; temp_min: number; temp_max: number; humidity: number }; weather: { main: string; description: string; icon: string }[]; wind: { speed: number } }[]) {
    const date = new Date(entry.dt * 1000).toISOString().slice(0, 10);
    const existing = byDay[date];
    if (!existing) {
      byDay[date] = entry;
    } else {
      // prefer closest to 12:00
      const existHour = new Date(existing.dt * 1000).getUTCHours();
      const thisHour = new Date(entry.dt * 1000).getUTCHours();
      if (Math.abs(thisHour - 12) < Math.abs(existHour - 12)) byDay[date] = entry;
    }
  }

  return {
    city: data.city.name,
    country: data.city.country,
    days: Object.entries(byDay).map(([date, e]) => ({
      date,
      tempMin: e.main.temp_min,
      tempMax: e.main.temp_max,
      humidity: e.main.humidity,
      windSpeed: e.wind.speed,
      description: e.weather[0].description,
      pop: (e as Record<string, unknown> & { pop?: number }).pop ?? 0,
      icon: `https://openweathermap.org/img/wn/${e.weather[0].icon}@2x.png`,
    })),
  };
}
