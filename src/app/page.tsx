import Image from 'next/image';
import Me from '../../public/me.jpg';
import Link from 'next/link';
import { BlogPostGrid } from '@/components/BlogPostGrid';
import { Timeline } from '@/components/Timeline';

export default function Home() {
  return (
    <main className='flex gap-12 flex-col'>
      <section className='flex gap-8 flex-col md:flex-row items-center'>
        <Image src={Me} alt='Photo of George' className='rounded-full w-40' />
        <div className='self-center md:order-0'>
          <h1 className='text-6xl font-black tracking-wide mb-4'>
            George McCarron
          </h1>

          <p className='text-lg'>
            I&apos;m a software engineer based in London, UK. I&apos;m currently
            building software that thinks like a real estate lawyer at Orbital
            Witness.
          </p>
        </div>
      </section>

      <section className='flex flex-col'>
        <h2 className='text-2xl font-semibold mb-4'>Latest Posts</h2>
        <BlogPostGrid limit={3} />
        <Link
          href='/blog'
          className='self-end border-2 border-slate-200 py-2 px-4 rounded-lg font-semibold text-slate-400 hover:bg-slate-100 w-full md:w-auto text-center mt-4 md:mt-8'
        >
          View All Posts
        </Link>
      </section>

      <section className='flex flex-col'>
        <h2 className='text-2xl font-semibold mb-4'>Timeline</h2>
        <Timeline />
      </section>
    </main>
  );
}
