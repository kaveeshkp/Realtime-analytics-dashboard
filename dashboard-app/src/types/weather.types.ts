export interface WeatherCurrent {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  timestamp: number;
}

export interface WeatherForecastDay {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  pop: number; // probability of precipitation
}

export interface WeatherForecast {
  city: string;
  country: string;
  days: WeatherForecastDay[];
}

export type TemperatureUnit = "metric" | "imperial" | "standard";
