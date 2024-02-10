import { postLikes } from '@/db/schema';
import LikePostClient from './LikePost.client';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { ClientOnly } from '@/components/ClientOnly';

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
