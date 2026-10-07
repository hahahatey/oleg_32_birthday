import type { Song } from './types';

type ITunesTrack = { artistName: string; trackName: string; artworkUrl100?: string };
type ITunesResponse = { results: ITunesTrack[] };

const toSong = (t: ITunesTrack): Song => ({
  label: `${t.artistName} — ${t.trackName}`,
  cover: t.artworkUrl100?.replace('100x100', '300x300') ?? null,
});

/** Songs from the Russian iTunes catalogue, de-duplicated by "Artist — Title". */
export const searchSongs = async (term: string, signal?: AbortSignal): Promise<Song[]> => {
  const params = new URLSearchParams({ term, entity: 'song', limit: '8', country: 'RU' });
  const res = await fetch(`https://itunes.apple.com/search?${params}`, { signal });
  if (!res.ok) return [];
  const { results }: ITunesResponse = await res.json();
  return [...new Map(results.map((t) => [toSong(t).label, toSong(t)])).values()].slice(0, 6);
};
