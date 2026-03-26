import type { FeedResult } from '@/types/feeds';
import { padRow } from './formatter';

const WMO_CODES: Record<number, string> = {
  0: 'CLEAR',
  1: 'MOSTLY CLEAR', 2: 'PARTLY CLOUDY', 3: 'OVERCAST',
  45: 'FOGGY', 48: 'FOGGY',
  51: 'LIGHT DRIZZLE', 53: 'DRIZZLE', 55: 'HEAVY DRIZZLE',
  61: 'LIGHT RAIN', 63: 'RAIN', 65: 'HEAVY RAIN',
  71: 'LIGHT SNOW', 73: 'SNOW', 75: 'HEAVY SNOW',
  77: 'SNOW GRAINS',
  80: 'LIGHT SHOWERS', 81: 'SHOWERS', 82: 'HEAVY SHOWERS',
  85: 'SNOW SHOWERS', 86: 'HEAVY SNOW SHOWERS',
  95: 'THUNDERSTORM', 96: 'THUNDERSTORM+HAIL', 99: 'THUNDERSTORM+HAIL',
};

function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

function mpsToMph(mps: number): number {
  return Math.round(mps * 2.237);
}

export async function fetchWeather(
  lat: number,
  lon: number,
  cols: number,
): Promise<FeedResult> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m',
  );
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weathercode');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'ms');
  url.searchParams.set('forecast_days', '3');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString(), { next: { revalidate: 900 } });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);

  const data = await res.json();
  const c = data.current;
  const d = data.daily;

  const tempF = cToF(c.temperature_2m);
  const feelsF = cToF(c.apparent_temperature);
  const wind = mpsToMph(c.windspeed_10m);
  const humidity = Math.round(c.relativehumidity_2m);
  const condition = WMO_CODES[c.weathercode] ?? 'UNKNOWN';

  const row1 = padRow(`WEATHER  ${tempF}F  ${condition}`, cols);
  const row2 = padRow(`FEELS ${feelsF}F  WIND ${wind}MPH  HUM ${humidity}%`, cols);

  // Show tomorrow's forecast
  const tomorrowMax = cToF(d.temperature_2m_max[1]);
  const tomorrowMin = cToF(d.temperature_2m_min[1]);
  const tomorrowCode = WMO_CODES[d.weathercode[1]] ?? '';
  const row3 = padRow(`TOMORROW ${tomorrowMin}/${tomorrowMax}F  ${tomorrowCode}`.slice(0, cols), cols);

  return {
    rows: [row1, row2, row3],
    feedName: 'WEATHER',
    feedIcon: 'sun',
    accentCols: [0],
    validUntil: Date.now() + 900_000,
    isRelevant: true,
  };
}
