'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { isTrack } from '@/lib/spotify';
import { useNowPlaying } from '@/hooks/useNowPlaying';

export const NowPlayingClient = () => {
  const { data } = useNowPlaying();

  if (!data) {
    return (
      <div className='flex flex-col gap-2'>
        <h3 className='font-medium text-md text-slate-500 flex items-center'>
          Nothing Playing <FontAwesomeIcon icon={faSpotify} className='ml-2' />
        </h3>
      </div>
    );
  }

  const image = isTrack(data.item)
    ? data.item.album.images.at(-1)
    : data.item.images.at(-1);
  const artist = isTrack(data.item)
    ? data.item.artists.map((artist) => artist.name).join(', ')
    : null;

  return (
    <div className='flex flex-col gap-2 w-full md:w-auto'>
      <h3 className='font-medium text-md text-slate-500 flex items-center'>
        Now Playing <FontAwesomeIcon icon={faSpotify} className='ml-2' />
      </h3>
      <div className='flex items-center'>
        {image ? (
          <Image
            src={image.url}
            width={image.width}
            height={image.height}
            alt=''
            className='rounded-md border border-slate-200 mr-4'
          />
        ) : null}
        <div>
          <h3 className='text-lg font-medium'>{data.item.name}</h3>
          <span>{artist}</span>
        </div>
      </div>
    </div>
  );
};
