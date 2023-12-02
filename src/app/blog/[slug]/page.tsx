import { Callout } from '@/components/Callout';
import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import { format } from 'date-fns';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import Image from 'next/image';
import { AboutAuthor } from '@/components/AboutAuthor';
import Link from 'next/link';
import { publishedPosts } from '@/lib/posts';

export const generateStaticParams = async () =>
  publishedPosts.map((post) => ({
    slug: post.slug,
  }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = publishedPosts.find((post) => post.slug === params.slug);
  if (!post) notFound();

  return { title: post.title };
};

export default function Page({ params }: { params: { slug: string } }) {
  const post = publishedPosts.find((post) => post.slug === params.slug);
  if (!post) notFound();

  const MDXContent = useMDXComponent(post.body.code);

  return (
    <main>
      <article className='flex flex-col'>
        <header className='mb-8'>
          <h1 className='text-6xl font-black tracking-wide mb-4'>
            {post.title}
          </h1>
          <h2 className='text-2xl font-medium text-zinc-600'>
            {post.subtitle}
          </h2>
          <span className='text-md text-zinc-400'>
            {format(new Date(post.date), 'LLLL dd, yyyy')}
          </span>
          <div className='relative w-full aspect-video mt-4 rounded-lg overflow-clip'>
            <Image
              fill
              src={post.heroImage}
              alt=''
              className='object-cover object-center'
            />
          </div>
        </header>
        <div className='prose max-w-none'>
          <MDXContent
            components={{
              Callout,
              YouTubeEmbed,
              Caption: ({ children }: { children?: ReactNode }) => (
                <figcaption className='text-center mt-0'>{children}</figcaption>
              ),
            }}
          />
        </div>
        <AboutAuthor />
        <Link
          href='/blog'
          className='self-center py-2 px-4 rounded-lg font-medium text-slate-400 hover:bg-slate-100 w-full md:w-auto text-center mt-4 md:mt-0'
        >
          Back to All Posts
        </Link>
      </article>
    </main>
  );
}
