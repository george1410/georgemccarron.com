import { PlaybackState } from '@spotify/web-api-ts-sdk';

export const getNowPlaying = async ({ signal }: { signal: AbortSignal }) =>
  fetch(`/api/now-playing`, { signal }).then((res) => {
    if (!res.ok) {
      throw new Error('Failed to fetch');
    }
    return res.json() as Promise<PlaybackState>;
  });
