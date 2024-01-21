CREATE TABLE IF NOT EXISTS "post_likes" (
	"post_id" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0
);
