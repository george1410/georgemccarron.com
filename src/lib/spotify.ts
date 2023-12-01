import { SpotifyApi, Track, Episode } from '@spotify/web-api-ts-sdk';
import { env } from '@/env';

const getAccessToken = () =>
  fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
    next: { revalidate: 60 },
  }).then((res) => res.json());

const getSpotifyClient = async () => {
  const accessToken = await getAccessToken();
  return SpotifyApi.withAccessToken(env.SPOTIFY_CLIENT_ID, accessToken, {
    fetch: (url, options) =>
      fetch(url, { ...options, next: { revalidate: 60 } }),
  });
};

export const getCurrentlyPlaying = async () => {
  const api = await getSpotifyClient();
  return api.player.getCurrentlyPlayingTrack();
};

export const isTrack = (item: Track | Episode): item is Track =>
  item.type === 'track';
