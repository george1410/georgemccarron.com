import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import { allTalks } from 'contentlayer/generated';
import { format } from 'date-fns';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { AboutAuthor } from '@/components/AboutAuthor';
import Link from 'next/link';

export const generateStaticParams = async () =>
  allTalks.map((talk) => ({
    slug: talk.slug,
  }));

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const talk = allTalks.find((talk) => talk.slug === params.slug);
  if (!talk) notFound();

  return { title: talk.title };
};

export default function Page({ params }: { params: { slug: string } }) {
  const talk = allTalks.find((talk) => talk.slug === params.slug);
  if (!talk) notFound();

  const MDXContent = useMDXComponent(talk.body.code);

  return (
    <main>
      <article className='flex flex-col'>
        <header className='mb-8'>
          <h1 className='text-6xl font-black tracking-wide mb-4'>
            {talk.title}
          </h1>
          <h2 className='text-2xl font-medium text-zinc-600'>
            {talk.conferenceUrl ? (
              <a
                href={talk.conferenceUrl}
                target='_blank'
                className='hover:underline'
              >
                {talk.conference}
              </a>
            ) : (
              talk.conference
            )}
          </h2>
          <span className='text-md text-zinc-400'>
            {format(new Date(talk.date), 'LLLL dd, yyyy')}
            {talk.location ? ` - ${talk.location}` : null}
          </span>
        </header>
        <div className='prose max-w-none'>
          <YouTubeEmbed url={talk.videoUrl} />
          <MDXContent />
        </div>
        <AboutAuthor />
        <Link
          href='/speaking'
          className='self-center py-2 px-4 rounded-lg font-medium text-slate-400 hover:bg-slate-100 w-full md:w-auto text-center mt-4 md:mt-0'
        >
          Back to All Talks
        </Link>
      </article>
    </main>
  );
}
