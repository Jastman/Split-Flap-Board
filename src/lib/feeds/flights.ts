import type { FeedResult } from '@/types/feeds';
import { sanitize, padRow } from './formatter';

interface ADSBLolFlight {
  flight: string;       // callsign
  r: string;            // registration
  t: string;            // aircraft type
  alt_baro: number | string; // altitude in feet (or "ground")
  gs: number;           // ground speed in knots
  track: number;        // heading
  lat: number;
  lon: number;
}

interface ADSBLolResponse {
  ac?: ADSBLolFlight[];
}

export async function fetchFlights(
  lat: number,
  lon: number,
  radiusDeg: number,
  cols: number,
): Promise<FeedResult | null> {
  // Convert degree radius to nautical miles (1 deg lat ≈ 60 nm)
  const radiusNm = Math.round(radiusDeg * 60);
  const url = `https://api.adsb.lol/v2/point/${lat}/${lon}/${radiusNm}`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FlipFlap/1.0' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`adsb.lol HTTP ${res.status}`);

    const data = (await res.json()) as ADSBLolResponse;
    const aircraft = (data.ac ?? []).filter(
      (a) => typeof a.alt_baro === 'number' && a.alt_baro > 0 && a.flight?.trim(),
    );

    if (aircraft.length === 0) return null;

    const a = aircraft[0];
    const callsign = sanitize((a.flight ?? a.r ?? 'UNKNOWN').trim()).slice(0, 8).padEnd(8);
    const altFt = typeof a.alt_baro === 'number' ? Math.round(a.alt_baro) : 0;
    const knots = Math.round(a.gs ?? 0);
    const type = sanitize((a.t ?? '').trim()).slice(0, 6);

    const row1 = padRow('OVERHEAD FLIGHTS', cols);
    const row2 = padRow(`${callsign}  ${type}`, cols);
    const row3 = padRow(`ALT ${altFt}FT  ${knots}KT`, cols);

    return {
      rows: [row1, row2, row3],
      feedName: 'FLIGHTS',
      feedIcon: '↑',
      accentCols: [],
      validUntil: Date.now() + 90_000,
      isRelevant: true,
    };
  } catch {
    return null;
  }
}
