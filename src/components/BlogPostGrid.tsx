import { publishedPosts } from '@/lib/posts';
import { compareDesc, format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';

export const BlogPostGrid = ({ limit }: { limit?: number }) => {
  const posts = publishedPosts
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, limit);

  return (
    <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto'>
      {posts.map((post) => (
        <Link key={post._id} href={`/blog/${post.slug}`} className='group'>
          <div className='mb-2 relative w-full aspect-video'>
            <Image
              fill
              src={post.heroImage}
              alt=''
              className='object-cover object-center rounded-md'
            />
          </div>
          <span className='text-sm text-zinc-400 font-semibold'>
            {format(new Date(post.date), 'LLLL dd, yyyy')}
          </span>
          <h2 className='font-bold text-lg group-hover:underline'>
            {post.title}
          </h2>
          <h3 className='text-[16px] leading-normal text-zinc-500 font-medium'>
            {post.subtitle}
          </h3>
        </Link>
      ))}
    </div>
  );
};
