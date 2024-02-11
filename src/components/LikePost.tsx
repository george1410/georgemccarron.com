import { postLikes } from '@/db/schema';
import LikePostClient from './LikePost.client';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { ClientOnly } from '@/components/ClientOnly';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/cn';

export default async function LikePost({ postId }: { postId: string }) {
  const likes = await db.query.postLikes.findFirst({
    where: eq(postLikes.postId, postId),
  });

  async function storeLike() {
    'use server';

    if (postId) {
      await db
        .insert(postLikes)
        .values({ postId: postId, count: 1 })
        .onConflictDoUpdate({
          target: postLikes.postId,
          set: { count: sql`${postLikes.count} + 1` },
        });
    }
  }

  return (
    <ClientOnly>
      <LikePostClient
        onLike={storeLike}
        currentLikes={likes?.count ?? 0}
        postId={postId}
      />
    </ClientOnly>
  );
}

export async function LikePostLoading() {
  return (
    <button
      disabled
      className='group gap-2 mt-12 font-medium shadow-md hover:shadow-lg transition-shadow duration-200 bg-zinc-100 py-2 px-4 self-center rounded-r-full rounded-l-full flex'
    >
      <FontAwesomeIcon
        icon={faSpinner}
        spin
        className={cn('text-2xl text-gray-300', 'group-hover:text-rose-300')}
      />
    </button>
  );
}
