import { getNowPlaying } from '@/api/nowPlaying';
import { useQuery } from '@tanstack/react-query';

export const useNowPlaying = () =>
  useQuery({
    queryKey: ['now-playing'],
    refetchInterval: 10 * 1000,
    queryFn: getNowPlaying,
  });
