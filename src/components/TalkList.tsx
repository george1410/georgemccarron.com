import { Talk, allTalks } from 'contentlayer/generated';
import { compareDesc, format } from 'date-fns';
import { YouTubeEmbed } from './YouTubeEmbed';
import { useMDXComponent } from 'next-contentlayer/hooks';
import Link from 'next/link';

const TalkListItem = ({ talk }: { talk: Talk }) => {
  const MDXContent = useMDXComponent(talk.body.code);

  return (
    <div className='flex gap-4 items-center'>
      <div>
        <YouTubeEmbed url={talk.videoUrl} />
      </div>
      <div className='flex-1'>
        <span className='text-sm text-zinc-400 font-semibold'>
          {talk.conference} - {format(new Date(talk.date), 'LLLL dd, yyyy')}
          {talk.location ? ` - ${talk.location}` : null}
        </span>

        <h2 className='font-bold text-lg hover:underline'>
          <Link href={`/speaking/${talk.slug}`}>{talk.title}</Link>
        </h2>
        <MDXContent />
      </div>
    </div>
  );
};

export const TalkList = ({ limit }: { limit?: number }) => {
  const talks = allTalks
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, limit);

  return (
    <div className='flex flex-col gap-6'>
      {talks.map((talk) => (
        <TalkListItem key={talk._id} talk={talk} />
      ))}
    </div>
  );
};
