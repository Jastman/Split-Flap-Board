import type { FeedResult } from '@/types/feeds';
import { sanitize, padRow } from './formatter';

interface LaunchRecord {
  name: string;
  net: string; // ISO date string
  rocket?: { configuration?: { name?: string } };
  launch_service_provider?: { name?: string };
}

interface LL2Response {
  results: LaunchRecord[];
}

function formatCountdown(netMs: number): string {
  const diff = netMs - Date.now();
  if (diff < 0) return 'LAUNCHED';
  const totalMin = Math.floor(diff / 60_000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `T-${days}D ${hours}H`;
  if (hours > 0) return `T-${hours}H ${mins}M`;
  return `T-${mins}M`;
}

export async function fetchLaunches(
  windowHours: number,
  cols: number,
): Promise<FeedResult | null> {
  const url =
    'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5&format=json';

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`LL2 ${res.status}`);

  const data: LL2Response = await res.json();
  const windowMs = windowHours * 3600_000;

  const upcoming = data.results.filter((launch) => {
    const netMs = new Date(launch.net).getTime();
    const diff = netMs - Date.now();
    return diff >= 0 && diff <= windowMs;
  });

  if (upcoming.length === 0) return null;

  const launch = upcoming[0];
  const netMs = new Date(launch.net).getTime();
  const countdown = formatCountdown(netMs);
  const vehicle = sanitize(
    launch.rocket?.configuration?.name ?? 'UNKNOWN VEHICLE',
  ).slice(0, 16);
  const name = sanitize(launch.name ?? 'LAUNCH').slice(0, cols);

  const row1 = padRow('ROCKET LAUNCH', cols);
  const row2 = padRow(name, cols);
  const row3 = padRow(`${vehicle}  ${countdown}`, cols);

  return {
    rows: [row1, row2, row3],
    feedName: 'LAUNCHES',
    feedIcon: 'rocket',
    accentCols: [0],
    validUntil: Date.now() + 300_000,
    isRelevant: true,
  };
}
