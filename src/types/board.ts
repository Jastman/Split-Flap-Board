export interface BoardState {
  rows: string[];
  feedName: string;
  feedIcon: string;
  accentCols: number[];
  nextRotationAt: number;
  revision: number;
}

export interface GridConfig {
  cols: number;
  rows: number;
}

export const FLAP_CHARACTERS =
  ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:!?-/\'@#$%&()°→←↑↓☀️🌤️⛅🌧️🌩️❄️🌠🚀🛸🌙🌑🌒🌓🌔🌕🌖🌗🌘';

// Safe subset for formatting (ASCII-only characters in the drum sequence)
export const SAFE_CHARS =
  ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:!?-/\'@#$%&()';
