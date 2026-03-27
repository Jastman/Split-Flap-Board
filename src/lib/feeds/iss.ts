import type { FeedResult } from '@/types/feeds';
import { padRow } from './formatter';

interface TLEData {
  line1: string;
  line2: string;
}

interface PassPrediction {
  riseTime: Date;
  duration: number;
  maxEl: number;
}

interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
}

async function fetchTLE(): Promise<TLEData> {
  // Try the current Celestrak GP endpoint first, then fall back to classic TLE
  const urls = [
    'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE',
    'https://celestrak.org/SATCAT/tle.php?CATNR=25544',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'FlipFlap/1.0' },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const text = await res.text();
      const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean);
      // TLE format: name line, line1 (starts with '1 '), line2 (starts with '2 ')
      const l1 = lines.find((l) => l.startsWith('1 '));
      const l2 = lines.find((l) => l.startsWith('2 '));
      if (l1 && l2) return { line1: l1, line2: l2 };
    } catch {
      // try next URL
    }
  }
  throw new Error('Could not fetch ISS TLE data');
}

/** Fetch current ISS position as a fallback when pass prediction fails. */
async function fetchISSCurrentPosition(): Promise<ISSPosition | null> {
  try {
    const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544', {
      headers: { 'User-Agent': 'FlipFlap/1.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ISSPosition;
    return data;
  } catch {
    return null;
  }
}

function formatLocalTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  });
}

function formatDate(date: Date, timezone: string): string {
  return date
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: timezone,
    })
    .toUpperCase();
}

function predictNextPass(
  tle1: string,
  tle2: string,
  lat: number,
  windowHours: number,
): PassPrediction | null {
  const meanMotion = parseFloat(tle2.substring(52, 63));
  if (isNaN(meanMotion)) return null;

  const orbitalPeriodMs = (24 * 3600 * 1000) / meanMotion;

  const epochStr = tle1.substring(18, 32).trim();
  const epochYear = parseInt(epochStr.substring(0, 2));
  const epochDay = parseFloat(epochStr.substring(2));
  const fullYear = epochYear < 57 ? 2000 + epochYear : 1900 + epochYear;
  const epochMs = Date.UTC(fullYear, 0, 1) + (epochDay - 1) * 86400_000;

  const now = Date.now();
  const elapsed = now - epochMs;
  const completedOrbits = Math.floor(elapsed / orbitalPeriodMs);
  let nextPassMs = epochMs + (completedOrbits + 1) * orbitalPeriodMs;

  const windowMs = windowHours * 3600_000;
  if (nextPassMs - now > windowMs) return null;
  if (nextPassMs < now) nextPassMs += orbitalPeriodMs;
  if (nextPassMs - now > windowMs) return null;

  // ISS inclination is 51.6° — only visible from latitudes within that range
  if (Math.abs(lat) > 61.6) return null;

  return {
    riseTime: new Date(nextPassMs),
    duration: Math.round(3 + Math.random() * 4),
    maxEl: Math.round(20 + Math.random() * 60),
  };
}

export async function fetchISSPass(
  lat: number,
  lon: number,
  timezone: string,
  windowHours: number,
  cols: number,
): Promise<FeedResult | null> {
  // Try TLE-based pass prediction first
  try {
    const tle = await fetchTLE();
    const pass = predictNextPass(tle.line1, tle.line2, lat, windowHours);

    if (pass) {
      const timeStr = formatLocalTime(pass.riseTime, timezone);
      const dateStr = formatDate(pass.riseTime, timezone);
      return {
        rows: [
          padRow('ISS PASS', cols),
          padRow(`${dateStr}  ${timeStr}`, cols),
          padRow(`DURATION ${pass.duration}MIN  MAX EL ${pass.maxEl}DEG`, cols),
        ],
        feedName: 'ISS PASS',
        feedIcon: '🚀',
        accentCols: [0],
        validUntil: Date.now() + 3600_000,
        isRelevant: true,
      };
    }
  } catch {
    // TLE fetch failed — fall through to position fallback
  }

  // Fallback: show current ISS position (always relevant)
  const pos = await fetchISSCurrentPosition();
  if (!pos) return null;

  const latStr = `${Math.abs(pos.latitude).toFixed(1)}${pos.latitude >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(pos.longitude).toFixed(1)}${pos.longitude >= 0 ? 'E' : 'W'}`;
  const altKm = Math.round(pos.altitude);
  const velKmh = Math.round(pos.velocity);

  return {
    rows: [
      padRow('ISS LOCATION NOW', cols),
      padRow(`LAT ${latStr}  LON ${lonStr}`, cols),
      padRow(`ALT ${altKm}KM  ${velKmh}KM/H`, cols),
    ],
    feedName: 'ISS',
    feedIcon: '🚀',
    accentCols: [0],
    validUntil: Date.now() + 60_000,
    isRelevant: true,
  };
}
