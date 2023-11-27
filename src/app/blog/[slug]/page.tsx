import { Callout } from '@/components/Callout';
import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import { allPosts } from 'contentlayer/generated';
import { format } from 'date-fns';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import Image from 'next/image';

export const generateStaticParams = async () =>
  allPosts.map((post) => ({
    slug: post.slug,
  }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post.slug === params.slug);
  if (!post) notFound();

  return { title: post.title };
};

export default function Page({ params }: { params: { slug: string } }) {
  const post = allPosts.find((post) => post.slug === params.slug);
  if (!post) notFound();

  const MDXContent = useMDXComponent(post.body.code);

  return (
    <main>
      <article>
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
      </article>
    </main>
  );
}
