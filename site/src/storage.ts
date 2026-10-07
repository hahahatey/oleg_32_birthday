import type { Bet, Song } from './types';

const KEY = 'oleg32-bet';

const isSong = (v: unknown): v is Song =>
  typeof v === 'object' && v !== null && 'label' in v && typeof v.label === 'string';

const isBet = (v: unknown): v is Bet =>
  typeof v === 'object' &&
  v !== null &&
  'name' in v &&
  typeof v.name === 'string' &&
  'songs' in v &&
  Array.isArray(v.songs) &&
  v.songs.every(isSong);

export const loadBet = (): Bet | null => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return isBet(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveBet = (bet: Bet): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(bet));
  } catch {
    // Private mode etc. — the bet is still emailed, only the "already sent" screen is lost.
  }
};
