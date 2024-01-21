import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const postLikes = pgTable('post_likes', {
  postId: text('post_id').primaryKey(),
  count: integer('count').default(0),
});
