import { getCurrentlyPlaying } from '@/lib/spotify';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { NowPlayingClient } from './NowPlaying.client';

export const NowPlaying = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['now-playing'],
    queryFn: getCurrentlyPlaying,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NowPlayingClient />
    </HydrationBoundary>
  );
};
