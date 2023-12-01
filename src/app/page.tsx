import Image from 'next/image';
import Me from '../../public/me.jpg';
import Link from 'next/link';
import { BlogPostGrid } from '@/components/BlogPostGrid';
import { Timeline } from '@/components/Timeline';
import { allTalks } from 'contentlayer/generated';
import { compareDesc, format } from 'date-fns';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { TalkList } from '@/components/TalkList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGithub,
  faLinkedin,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { SocialIcons } from '@/components/SocialIcons';

export default function Home() {
  const latestTalk = allTalks.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  )[0];
  const MDXContent = useMDXComponent(latestTalk.body.code);

  return (
    <main className='flex gap-12 flex-col'>
      <section className='flex gap-8 flex-col md:flex-row items-center'>
        <Image src={Me} alt='Photo of George' className='rounded-full w-40' />
        <div className='self-center md:order-0 gap-2 flex flex-col'>
          <h1 className='text-6xl font-black tracking-wide'>George McCarron</h1>

          <p className='text-lg'>
            I&apos;m a software engineer based in London, UK. I&apos;m currently
            building software that thinks like a Real Estate Lawyer at Orbital
            Witness.
          </p>

          <SocialIcons />
        </div>
      </section>

      <section className='flex flex-col'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-semibold'>Recent Posts</h2>
          <Link
            href='/blog'
            className='self-end py-2 px-4 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 w-full md:w-auto text-center'
          >
            View All Posts
          </Link>
        </div>
        <BlogPostGrid limit={3} />
      </section>

      <section className='flex flex-col'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-2xl font-semibold'>Latest Talk</h2>
          <Link
            href='/speaking'
            className='self-end py-2 px-4 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 w-full md:w-auto text-center'
          >
            View All Talks
          </Link>
        </div>
        <TalkList limit={1} />
      </section>

      <section className='flex flex-col'>
        <h2 className='text-2xl font-semibold mb-4'>Timeline</h2>
        <Timeline />
      </section>
    </main>
  );
}
