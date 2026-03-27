export interface AppConfig {
  id: 1;
  latitude: number;
  longitude: number;
  timezone: string;
  cols: number;
  rows: number;
  fontSize: number;
  flipSpeed: number;
  waveDelay: number;
  audioEnabled: boolean;
  audioVolume: number;
  brightness: number;
  accentColor: string;
  boardBg: string;
  cellBg: string;
  charColor: string;
  fontFamily: string;
  cellWidth: string;
  cellHeight: string;
  presetId: string;
  rotationInterval: number;
  textHAlign: 'left' | 'center' | 'right' | 'justify';
  textVAlign: 'top' | 'middle' | 'bottom';
}

export interface BoardPreset {
  id: string;
  name: string;
  location: string;
  cols: number;
  rows: number;
  boardBg: string;
  cellBg: string;
  charColor: string;
  accentColor: string;
  fontFamily: string;
  cellWidth: string;
  cellHeight: string;
}

export const BOARD_PRESETS: BoardPreset[] = [
  {
    id: 'twa',
    name: 'Classic TWA',
    location: 'New York JFK',
    cols: 32,
    rows: 4,
    boardBg: '#1a1a1a',
    cellBg: '#111111',
    charColor: '#f5f0e8',
    accentColor: '#e85d04',
    fontFamily: "'Courier Prime', 'Courier New', monospace",
    cellWidth: '2.4rem',
    cellHeight: '4rem',
  },
  {
    id: 'kings-cross',
    name: 'Kings Cross',
    location: 'London, UK',
    cols: 22,
    rows: 4,
    boardBg: '#0a0a0a',
    cellBg: '#0d0d0d',
    charColor: '#ffffff',
    accentColor: '#003399',
    fontFamily: "'Courier New', monospace",
    cellWidth: '2.6rem',
    cellHeight: '4.2rem',
  },
  {
    id: 'paris-nord',
    name: 'Paris Gare du Nord',
    location: 'Paris, France',
    cols: 24,
    rows: 3,
    boardBg: '#1c1a17',
    cellBg: '#141210',
    charColor: '#fffde7',
    accentColor: '#c8a435',
    fontFamily: "'Courier Prime', monospace",
    cellWidth: '2.5rem',
    cellHeight: '4rem',
  },
  {
    id: 'schiphol',
    name: 'Amsterdam Schiphol',
    location: 'Amsterdam, NL',
    cols: 28,
    rows: 4,
    boardBg: '#003082',
    cellBg: '#002570',
    charColor: '#ffffff',
    accentColor: '#009fd4',
    fontFamily: "'Courier New', monospace",
    cellWidth: '2.2rem',
    cellHeight: '3.8rem',
  },
  {
    id: 'grand-central',
    name: 'Grand Central',
    location: 'New York City',
    cols: 26,
    rows: 3,
    boardBg: '#2b1d0e',
    cellBg: '#221508',
    charColor: '#f0e6cc',
    accentColor: '#8b6914',
    fontFamily: "'Courier Prime', monospace",
    cellWidth: '2.4rem',
    cellHeight: '4rem',
  },
  {
    id: 'penn-station',
    name: 'Penn Station',
    location: 'New York City',
    cols: 24,
    rows: 3,
    boardBg: '#111111',
    cellBg: '#0a0a0a',
    charColor: '#e8e8e8',
    accentColor: '#cc0000',
    fontFamily: "'Courier New', monospace",
    cellWidth: '2.5rem',
    cellHeight: '4rem',
  },
  {
    id: 'minimal',
    name: 'Minimal Dark',
    location: 'Modern',
    cols: 20,
    rows: 2,
    boardBg: '#000000',
    cellBg: '#0a0a0a',
    charColor: '#ffffff',
    accentColor: '#444444',
    fontFamily: "'IBM Plex Mono', monospace",
    cellWidth: '2.8rem',
    cellHeight: '4.5rem',
  },
  {
    id: 'custom',
    name: 'Custom',
    location: '',
    cols: 32,
    rows: 4,
    boardBg: '#1a1a1a',
    cellBg: '#111111',
    charColor: '#f5f0e8',
    accentColor: '#e85d04',
    fontFamily: "'Courier Prime', monospace",
    cellWidth: '2.4rem',
    cellHeight: '4rem',
  },
];

export const DEFAULT_CONFIG: AppConfig = {
  id: 1,
  latitude: 40.7128,
  longitude: -74.006,
  timezone: 'America/New_York',
  cols: 32,
  rows: 4,
  fontSize: 1.0,
  flipSpeed: 150,
  waveDelay: 40,
  audioEnabled: true,
  audioVolume: 0.7,
  brightness: 1.0,
  accentColor: '#e85d04',
  boardBg: '#1a1a1a',
  cellBg: '#111111',
  charColor: '#f5f0e8',
  fontFamily: "'Courier Prime', 'Courier New', monospace",
  cellWidth: '2.4rem',
  cellHeight: '4rem',
  presetId: 'twa',
  rotationInterval: 30,
  textHAlign: 'center',
  textVAlign: 'top',
};
