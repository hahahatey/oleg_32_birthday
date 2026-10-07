export type Song = { label: string; cover: string | null };

export type Bet = { name: string; songs: Song[] };

export const SONGS_COUNT = 5;
