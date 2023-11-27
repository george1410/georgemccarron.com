import { BlogPostGrid } from '@/components/BlogPostGrid';

export default function Blog() {
  return (
    <main>
      <section>
        <h1 className='text-6xl font-black tracking-wide mb-4'>Blog</h1>
      </section>
      <BlogPostGrid />
    </main>
  );
}
