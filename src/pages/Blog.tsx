import { PostCard } from "../components/PostCard";
import { posts } from "../data/posts";
import { useTitle } from "../hooks/useTitle";

export function Blog() {
  useTitle("Blog");
  return (
    <div>
      <h1 className="font-serif italic text-5xl md:text-6xl tracking-tight mb-10">
        <span className="gradient-text-animated">Blog</span>
      </h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
