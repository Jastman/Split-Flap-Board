import type { FeedConfig } from '@/types/feeds';

export const DEFAULT_FEEDS: FeedConfig[] = [
  {
    id: 'weather',
    type: 'weather',
    label: 'Weather',
    enabled: true,
    config: {},
    cacheTtl: 900,
    priority: 10,
  },
  {
    id: 'news',
    type: 'news',
    label: 'News',
    enabled: true,
    config: { rssUrl: 'https://feeds.bbci.co.uk/news/rss.xml', source: 'BBC NEWS' },
    cacheTtl: 900,
    priority: 8,
  },
  {
    id: 'moon',
    type: 'moon',
    label: 'Moon Phase',
    enabled: true,
    config: {},
    cacheTtl: 86400,
    priority: 3,
  },
  {
    id: 'wikipedia',
    type: 'wikipedia',
    label: 'On This Day',
    enabled: true,
    config: {},
    cacheTtl: 86400,
    priority: 3,
  },
  {
    id: 'launches',
    type: 'launches',
    label: 'Rocket Launches',
    enabled: true,
    config: { windowHours: 48 },
    cacheTtl: 300,
    priority: 9,
  },
  {
    id: 'iss',
    type: 'iss',
    label: 'ISS Passes',
    enabled: true,
    config: { windowHours: 6 },
    cacheTtl: 3600,
    priority: 9,
  },
  {
    id: 'flights',
    type: 'flights',
    label: 'Overhead Flights',
    enabled: true,
    config: { radiusDeg: 0.5 },
    cacheTtl: 90,
    priority: 7,
  },
  {
    id: 'quotes',
    type: 'quotes',
    label: 'Quotes',
    enabled: true,
    config: { categories: ['optimism', 'meaning', 'parenting', 'universe'] },
    cacheTtl: 0,
    priority: 1,
  },
];

export const DEFAULT_SCHEDULE: Array<{
  position: number;
  feedId?: string;
  messageId?: number;
  duration: number;
  enabled: boolean;
}> = [
  { position: 0, feedId: 'weather', duration: 30, enabled: true },
  { position: 1, feedId: 'news', duration: 25, enabled: true },
  { position: 2, feedId: 'launches', duration: 25, enabled: true },
  { position: 3, feedId: 'iss', duration: 25, enabled: true },
  { position: 4, feedId: 'flights', duration: 20, enabled: true },
  { position: 5, feedId: 'wikipedia', duration: 25, enabled: true },
  { position: 6, feedId: 'moon', duration: 20, enabled: true },
  { position: 7, feedId: 'quotes', duration: 30, enabled: true },
];

export const DEFAULT_MESSAGES = [
  {
    label: 'Optimism — Helen Keller',
    body: 'OPTIMISM IS THE FAITH\nTHAT LEADS TO ACHIEVEMENT\n— HELEN KELLER',
    category: 'optimism',
    enabled: true,
  },
  {
    label: 'Optimism — Frank Sinatra',
    body: 'THE BEST\nIS YET TO COME\n— FRANK SINATRA',
    category: 'optimism',
    enabled: true,
  },
  {
    label: 'Universe — Carl Sagan',
    body: 'WE ARE A WAY FOR\nTHE COSMOS TO KNOW ITSELF\n— CARL SAGAN',
    category: 'universe',
    enabled: true,
  },
  {
    label: 'Universe — Stephen Hawking',
    body: 'LOOK UP AT THE STARS\nNOT DOWN AT YOUR FEET\n— STEPHEN HAWKING',
    category: 'universe',
    enabled: true,
  },
  {
    label: 'Meaning — Pablo Picasso',
    body: 'THE MEANING OF LIFE IS\nTO FIND YOUR GIFT\n— PABLO PICASSO',
    category: 'meaning',
    enabled: true,
  },
  {
    label: 'Meaning — Oscar Wilde',
    body: 'TO LIVE IS THE RAREST THING\nMOST PEOPLE EXIST THAT IS ALL\n— OSCAR WILDE',
    category: 'meaning',
    enabled: true,
  },
  {
    label: 'Parenting — Jess Lair',
    body: 'CHILDREN ARE NOT THINGS\nTO BE MOLDED BUT PEOPLE\nTO BE UNFOLDED — JESS LAIR',
    category: 'parenting',
    enabled: true,
  },
  {
    label: 'Parenting — John Wooden',
    body: 'THE MOST IMPORTANT THING\nIN THE WORLD IS\nFAMILY AND LOVE',
    category: 'parenting',
    enabled: true,
  },
  {
    label: 'Universe — Carl Sagan (Pale Blue Dot)',
    body: 'PALE BLUE DOT\nA MOTE OF DUST\nSUSPENDED IN A SUNBEAM',
    category: 'universe',
    enabled: true,
  },
  {
    label: 'Optimism — Walt Whitman',
    body: 'KEEP YOUR FACE\nALWAYS TOWARD\nTHE SUNSHINE — WHITMAN',
    category: 'optimism',
    enabled: true,
  },
];
