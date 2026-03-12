import axios from 'axios';
import { WeatherNow, ForecastDay } from '../types';

const API_KEY  = process.env.OPENWEATHER_API_KEY ?? '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function requireKey(): void {
  if (!API_KEY) {
    throw new Error(
      'OPENWEATHER_API_KEY is not set. ' +
      'Get a free key at https://openweathermap.org/api',
    );
  }
}

export async function fetchCurrentWeather(city: string): Promise<WeatherNow> {
  requireKey();

  const { data } = await axios.get(`${BASE_URL}/weather`, {
    params:  { q: city, appid: API_KEY, units: 'metric' },
    timeout: 10_000,
  });

  return {
    city:        data.name              as string,
    country:     data.sys.country       as string,
    temp:        Math.round(data.main.temp        as number),
    feelsLike:   Math.round(data.main.feels_like  as number),
    humidity:    data.main.humidity     as number,
    windSpeed:   data.wind.speed        as number,
    description: data.weather[0].description as string,
    icon:        data.weather[0].icon        as string,
  };
}

export async function fetchWeatherForecast(city: string): Promise<ForecastDay[]> {
  requireKey();

  const { data } = await axios.get(`${BASE_URL}/forecast`, {
    params:  { q: city, appid: API_KEY, units: 'metric' },
    timeout: 10_000,
  });

  // Aggregate all 3-hour slots by calendar day
  const dailyMap = new Map<
    string,
    { highs: number[]; lows: number[]; noonItem: any; noonHourDiff: number }
  >();

  for (const item of data.list as any[]) {
    const [datePart, timePart] = (item.dt_txt as string).split(' ');
    const hour = parseInt(timePart.split(':')[0], 10);

    if (!dailyMap.has(datePart)) {
      dailyMap.set(datePart, {
        highs:        [item.main.temp_max as number],
        lows:         [item.main.temp_min as number],
        noonItem:     item,
        noonHourDiff: Math.abs(hour - 12),
      });
    } else {
      const day = dailyMap.get(datePart)!;
      day.highs.push(item.main.temp_max as number);
      day.lows.push(item.main.temp_min as number);
      // Replace with slot closest to noon for icon / description
      const diff = Math.abs(hour - 12);
      if (diff < day.noonHourDiff) {
        day.noonItem     = item;
        day.noonHourDiff = diff;
      }
    }
  }

  // Skip today (index 0), return up to 5 future days
  const futureDays = [...dailyMap.entries()].slice(1, 6);

  return futureDays.map(([datePart, day]) => ({
    date: formatDay(datePart),
    high: Math.round(Math.max(...day.highs)),
    low:  Math.round(Math.min(...day.lows)),
    desc: day.noonItem.weather[0].description as string,
    icon: day.noonItem.weather[0].icon        as string,
  }));
}

function formatDay(datePart: string): string {
  // datePart = 'YYYY-MM-DD'; append T12:00:00 to avoid timezone shift
  return new Date(datePart + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  });
}
