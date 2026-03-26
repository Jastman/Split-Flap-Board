import type { FeedResult } from '@/types/feeds';
import { sanitize, padRow } from './formatter';

interface OpenSkyState {
  // [icao24, callsign, origin_country, time_position, last_contact,
  //  longitude, latitude, baro_altitude, on_ground, velocity,
  //  true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source]
  0: string;  // icao24
  1: string;  // callsign
  2: string;  // origin_country
  8: boolean; // on_ground
  9: number;  // velocity m/s
  10: number; // true_track
  7: number;  // baro_altitude (meters)
}

interface OpenSkyResponse {
  states: OpenSkyState[] | null;
}

function msToKnots(ms: number): number {
  return Math.round(ms * 1.944);
}

function metersToFeet(m: number): number {
  return Math.round(m * 3.281);
}

export async function fetchFlights(
  lat: number,
  lon: number,
  radiusDeg: number,
  cols: number,
): Promise<FeedResult | null> {
  const lamin = lat - radiusDeg;
  const lamax = lat + radiusDeg;
  const lomin = lon - radiusDeg;
  const lomax = lon + radiusDeg;

  const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

  const res = await fetch(url, { next: { revalidate: 90 } });
  if (!res.ok) throw new Error(`OpenSky ${res.status}`);

  const data: OpenSkyResponse = await res.json();
  const states = data.states ?? [];

  // Filter: airborne only, with callsign
  const airborne = states.filter(
    (s) => !s[8] && s[1]?.trim() && s[7] != null && s[7] > 0,
  );

  if (airborne.length === 0) return null;

  const aircraft = airborne[0];
  const callsign = sanitize(aircraft[1]?.trim() ?? 'UNKNOWN').slice(0, 8);
  const country = sanitize(aircraft[2] ?? '').slice(0, 12);
  const altFt = metersToFeet(aircraft[7] ?? 0);
  const knots = msToKnots(aircraft[9] ?? 0);

  const row1 = padRow('OVERHEAD FLIGHTS', cols);
  const row2 = padRow(`${callsign}  ${country}`, cols);
  const row3 = padRow(`ALT ${altFt}FT  ${knots}KT`, cols);

  return {
    rows: [row1, row2, row3],
    feedName: 'FLIGHTS',
    feedIcon: 'plane',
    accentCols: [0],
    validUntil: Date.now() + 90_000,
    isRelevant: true,
  };
}
