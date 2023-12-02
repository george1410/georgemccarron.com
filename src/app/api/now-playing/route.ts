import { getCurrentlyPlaying } from '@/lib/spotify';

export async function GET() {
  const nowPlaying = await getCurrentlyPlaying();

  return Response.json(nowPlaying);
}
