export type FeedType =
  | 'weather'
  | 'flights'
  | 'news'
  | 'launches'
  | 'iss'
  | 'moon'
  | 'wikipedia'
  | 'calendar'
  | 'quotes';

export interface FeedConfig {
  id: string;
  type: FeedType;
  label: string;
  enabled: boolean;
  config: Record<string, unknown>;
  cacheTtl: number;
  priority: number;
}

export interface FeedResult {
  rows: string[];
  feedName: string;
  feedIcon: string;
  accentCols?: number[];
  validUntil: number;
  isRelevant: boolean;
}
