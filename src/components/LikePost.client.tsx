'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { useLocalStorage } from '@uidotdev/usehooks';
import { cn } from '@/lib/cn';
import { useState } from 'react';

export default function LikePost({
  onLike,
  currentLikes,
  postId,
}: {
  onLike: () => Promise<void>;
  currentLikes: number;
  postId: string;
}) {
  const [likedPosts, setLikedPosts] = useLocalStorage<string[]>(
    'likedPosts',
    []
  );
  const [likes, setLikes] = useState(currentLikes);

  const hasLiked = likedPosts.includes(postId);

  return (
    <button
      disabled={hasLiked}
      onClick={async () => {
        setLikedPosts([...likedPosts, postId]);
        setLikes(likes + 1);
        await onLike();
      }}
      className='group gap-2 mt-12 font-medium shadow-md hover:shadow-lg transition-shadow duration-200 bg-zinc-100 py-2 px-4 self-center rounded-r-full rounded-l-full flex'
    >
      <FontAwesomeIcon
        icon={faHeart}
        className={cn(
          'text-2xl text-gray-300',
          hasLiked ? 'text-rose-500' : 'group-hover:text-rose-300'
        )}
      />
      <p className='text-rose-500'>{likes}</p>
    </button>
  );
}
